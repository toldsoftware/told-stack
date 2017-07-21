import { TestConfig } from "@told/stack/src/payment/stripe/config/test-config";
import { clientConfig } from "./stripe-client";
import { config } from "./stripe-server";
import * as Tests from "@told/stack/src/payment/stripe/test/_tests";
import { TestContext } from "../../../../../told-stack-npm/src/core/testing/integration-testing";

export const paymentTests = [
    (testContext: TestContext) => Tests.test_001_new_user(testContext, new TestConfig(clientConfig, config, { shouldUseNewProduct: true })),
    (testContext: TestContext) => Tests.test_001_new_user(testContext, new TestConfig(clientConfig, config, { shouldUseNewProduct: false })),
];