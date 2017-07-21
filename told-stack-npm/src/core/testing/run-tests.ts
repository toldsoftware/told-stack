import { TestContext } from "./integration-testing";
import { maxTimeout } from "../utils/time";

export type TestDefinition = (testContext: TestContext) => { name: string, run: () => void };
export type CreateTestContext = (options: { log: typeof console.log, rootUrl: string, notifyFailure: () => void }) => TestContext

export const runTests = async (tests: TestDefinition[], options: {
    log: typeof console.log, rootUrl: string
}, createTestContext: CreateTestContext, maxTimeMS = 15000
) => {
    const { log, rootUrl } = options;
    const testRuns: (() => () => Promise<void>)[] = [];

    let i = 0;
    for (let x of tests) {

        testRuns.push(() => async () => {
            const runId = i++;
            let failCount = 0;
            let prefix = `[${runId}] `;

            let _logDirect = false;
            let _logHistory: { message: string, args: any[] }[] = [];
            const log_wrapper = (message: string, ...args: any[]) => {
                if (_logDirect) { log(prefix + message, ...args); return; }

                _logHistory.push({ message: prefix + message, args });
            };
            const log_printHistory = () => {
                _logHistory.forEach(x => {
                    log(x.message, ...x.args);
                });
            };

            const notifyFailure = () => {
                if (_logDirect) { return; }

                log_printHistory();
                _logHistory = [];

                failCount++;
                prefix = `[${runId}:${failCount}] `;
                log(`=> FAILURE: ${t.name} ${prefix}`);
                // _logDirect = true;
            };

            const testContext = createTestContext({
                log: log_wrapper,
                rootUrl,
                notifyFailure,
            });

            const t = x(testContext);
            const startTime = Date.now();
            log(`START ${t.name} ${prefix}`);

            await maxTimeout(maxTimeMS, async () => {
                try {
                    await t.run();
                    const r = testContext.getResult();
                    if (r.result === 'pass') {
                        // log(`=> PASS`);
                        log(`=> PASS: ${t.name} @${Date.now() - startTime}ms ${prefix}`);
                        return;
                    }

                    log_wrapper(`=> ${r.result.toUpperCase()}`, r);

                } catch (err) {
                    log_wrapper(`=> ERROR`, { err });
                }

                notifyFailure();
            });

        });
    }

    // Run Parallel (Need to adjust log to not print start)
    const testPromises = testRuns.map(x => x()());
    await Promise.all(testPromises);

    // // Run Serial
    // for (let t of testRuns) {
    //     await t()();
    // }
};