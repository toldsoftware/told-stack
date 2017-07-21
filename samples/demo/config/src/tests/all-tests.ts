import { ServerConfig } from "@told/stack/src/core/tester/config/server-config";
import { TestContext_Server } from "@told/stack/src/core/testing/test-context-server";
import { runTests as runTestsInner } from "@told/stack/src/core/testing/run-tests";
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
export const runTests = async () => {
    await runTestsInner(tests, {
        log: console.log.bind(console),
        rootUrl: process.env['TEST_ROOT_URL']
    }, (options) => new TestContext_Server(options));
};

export const config = new ServerConfig('test/all-tests', runTests);
