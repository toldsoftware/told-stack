import { ServerConfig } from "@told/stack/src/core/tester/config/server-config";
import { TestContext_Server } from "@told/stack/src/core/testing/test-context-server";
import { maxTimeout } from "@told/stack/src/core/utils/time";

import { paymentTests } from "../payment/stripe-test";

const tests = [
    ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
    // ...paymentTests,
];

export const runTests = async (log: typeof console.log, maxTimeMS = 5000) => {

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

            const testContext = new TestContext_Server({
                log: log_wrapper,
                rootUrl: process.env['TEST_ROOT_URL'],
                notifyFailure,
            });

            const t = x(testContext);
            const startTime = Date.now();
            log(`START ${t.name} ${prefix}`);

            await maxTimeout(maxTimeMS, async () => {
                try {
                    const r = await t.run();
                    if (r.result === 'pass') {
                        // log(`=> PASS`);
                        log(`=> PASS: ${t.name} (${Date.now() - startTime}ms) ${prefix}`);
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

export const config = new ServerConfig('test/all-tests', runTests);
