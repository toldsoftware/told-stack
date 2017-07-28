import { TestContext } from "../../../core/testing/integration-testing";
import { runTests as runTestsInner } from "../../../core/testing/run-tests";
import { TestContext_Server } from "../../../core/testing/test-context-server";
import { TestConfig } from "./_config";

import {
    new_user,
    new_user_with_session_lookup_user,
    new_user_with_session_lookup_permissions,
} from "./tests_001_new_user";

import {
    can_add_email_alias,
    can_use_email_alias,
    can_send_email_reset_password,
} from "./tests_002_existing_user";

export const tests = [
    (testContext: TestContext) => new_user(testContext, new TestConfig()),
    (testContext: TestContext) => new_user_with_session_lookup_user(testContext, new TestConfig()),
    (testContext: TestContext) => new_user_with_session_lookup_permissions(testContext, new TestConfig()),
    (testContext: TestContext) => can_add_email_alias(testContext, new TestConfig()),
    (testContext: TestContext) => can_use_email_alias(testContext, new TestConfig()),
    (testContext: TestContext) => can_send_email_reset_password(testContext, new TestConfig()),
];

export const runTests = async () => {
    await runTestsInner(tests, {
        log: console.log.bind(console),
        rootUrl: process.env['TEST_ROOT_URL']
    }, (options) => new TestContext_Server(options));
};

runTests();