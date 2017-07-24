import { TestContext } from "../../../core/testing/integration-testing";
import { paymentTests } from "./common/debug-config";
import { runTests as runTestsInner } from "../../../core/testing/run-tests";
import { TestContext_Server } from "../../../core/testing/test-context-server";

const tests = paymentTests;

export const runTests = async () => {
    await runTestsInner(tests, {
        log: console.log.bind(console),
        rootUrl: process.env['TEST_ROOT_URL']
    }, (options) => new TestContext_Server(options));
};

runTests();