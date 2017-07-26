import { createTest } from "../../../core/testing/integration-testing";
import { TestConfig } from "../config/test-config";
import { createCheckoutSubmitRequest } from "./common/createRequest";
import { verifyPurchase } from "./common/verify-purchase";

export const test_001_new_user = createTest<TestConfig>((testConfig) => ({
    name: `A New User Should Purchase a Product (${testConfig.options.shouldUseNewProduct ? 'New Product' : ''})`,
    run: async (testContext) => {

        const testCode = `001newuser${testConfig.options.shouldUseNewProduct ? 'P' : ''}`;
        const clientCheckoutId = `test_${testCode}_${Date.now()}`;
        const email = `${clientCheckoutId}@toldstack.com`;
        const request = createCheckoutSubmitRequest(clientCheckoutId, testCode, email, testConfig.options.shouldUseNewProduct);

        await verifyPurchase(testContext, testConfig, { email, clientCheckoutId, request });
    },
}));
