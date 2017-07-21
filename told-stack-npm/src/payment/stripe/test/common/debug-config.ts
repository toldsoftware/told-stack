import * as Tests from '../_tests';
import { TestContext } from "../../../../core/testing/integration-testing";
import { TestConfig } from "../../config/test-config";
import { ClientConfig } from "../../config/client-config";
import { ServerConfig } from "../../config/server-config";

export const clientConfig = new ClientConfig();
export const serverConfig = new ServerConfig();

export const paymentTests = [
    (testContext: TestContext) => Tests.test_001_new_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: true })),
    (testContext: TestContext) => Tests.test_001_new_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: false })),
    (testContext: TestContext) => Tests.test_002_existing_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: true })),
    (testContext: TestContext) => Tests.test_002_existing_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: false })),
];