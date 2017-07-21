import { createTest } from "../../../core/testing/integration-testing";
import { TestConfig } from "../config/test-config";
import { createCheckoutSubmitRequest } from "./common/createRequest";
import { verifyPurchase } from "./common/verifyPurchase";

export const test_002_existing_user = createTest<TestConfig>((testConfig: TestConfig) => ({
    name: `An Existing User Should Purchase a Product (${testConfig.options.shouldUseNewProduct ? 'New Product' : ''})`,
    run: async (testContext) => {
        
        const testCode = `002existinguser${testConfig.options.shouldUseNewProduct ? 'P' : ''}`;
        const clientCheckoutId = `test_${testCode}_${Date.now()}`;
        const email = `existinguser@toldstack.com`;
        const request = createCheckoutSubmitRequest(clientCheckoutId, testCode, email, testConfig.options.shouldUseNewProduct);

        await verifyPurchase(testContext, testConfig, { email, clientCheckoutId, request });
    },
}));
