import { ServerConfig } from "@told/stack/src/core/tester/config/server-config";
import { TestContext_Server } from "@told/stack/src/core/testing/test-context-server";
import { maxTimeout } from "@told/stack/src/core/utils/time";

import { paymentTests } from "../payment/stripe-test";

const tests = [
    ...paymentTests,
];

export const runTests = async (log: typeof console.log, maxTimeMS = 5000) => {

    const testContext = new TestContext_Server({
        log,
        rootUrl: process.env['TEST_ROOT_URL']
    });

    for (let x of tests) {
        const t = x(testContext);
        log(`TEST ${t.name}`);

        // TODO: These could run parallel
        await maxTimeout(maxTimeMS, async () => {
            try {
                const r = await t.run();
                log(`  : ${r.result.toUpperCase()}`, r);
            } catch (err) {
                log(`  : FAIL ERROR`, { err });
            }
        });
    }

};

export const config = new ServerConfig('test/all-tests', runTests);
