import * as Tests from '../_tests';
import { TestContext } from "../../../../core/testing/integration-testing";
import { TestConfig } from "../../config/test-config";
import { ClientConfig } from "../../config/client-config";
import { ServerConfig } from "../../config/server-config";
import { AccountServerConfig } from "../../../../core/account/config/server-config";

// TODO: Modify CreateRequest to use this
// TODO: Use this for samples/demo config for deploy

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
    getSessionInfo: async () => ({
        sessionToken: 'userToken42',
        userId_claimed: '',
        isAnonymous: true,
    }),
});

// Used by the Demo Config for server testing
export const accountConfig = new AccountServerConfig();

export const serverConfig = new ServerConfig(clientConfig, {
    executeRequest: async () => { },
}, accountConfig);

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