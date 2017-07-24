import * as Tests from '../_tests';
import { TestContext } from "../../../../core/testing/integration-testing";
import { TestConfig } from "../../config/test-config";
import { ClientConfig } from "../../config/client-config";
import { ServerConfig } from "../../config/server-config";

export const clientConfig = new ClientConfig({
    stripePublishableKey: 'pk_stripe_publishable_key_1234',
    checkoutOptions: {
        business: {
            name: 'Told Software',
            imageUrl: 'https://toldstackdemo.blob.core.windows.net/images/ToldLogo128.png',
            statementDescriptor: 'ToldSoft',
        },
        requirements: {
            requireZipCode: true,
            requireBillingAddress: true,
        },
        experience: {
            allowRememberMe: true
        },
    },
    // Needs to work with Server
    getSessionToken: async () => ({ sessionToken: 'userToken42' }),
});

// Used by the Demo Config for server testing
export const serverConfig = new ServerConfig(clientConfig, {
    executeRequest: async () => { },
    lookupUser_sessionToken: async (sessionToken) => ({
        userId: '42',
        isAnonymousUser: false,
    }),
    lookupUser_stripeEmail: async (userToken) => ({
        userId: '42'
    }),
});

export const userDebugCodes = {
    newUser: 'new_user',
    existingUser: 'existing_user',
    notFoundUser: 'not_found',
    alreadyOwnedEmailUser: 'owned_email',
};

export const paymentTests = [
    (testContext: TestContext) => Tests.test_001_new_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: true })),
    (testContext: TestContext) => Tests.test_001_new_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: false })),
    (testContext: TestContext) => Tests.test_002_existing_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: true })),
    (testContext: TestContext) => Tests.test_002_existing_user(testContext, new TestConfig(clientConfig, serverConfig, { shouldUseNewProduct: false })),
];