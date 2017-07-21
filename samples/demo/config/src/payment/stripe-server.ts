import { ServerConfig, StripeCheckoutRuntimeConfig } from "@told/stack/src/payment/stripe/config/server-config";
import { clientConfig } from "./stripe-client";
import { executeRequest } from '../../../src-server/src/execute-stripe-checkout';

const runtimeConfig: StripeCheckoutRuntimeConfig = {
    executeRequest,
    lookupUserByUserToken: async (token) => ({ userId: '42' }),
    getOrCreateCurrentUserId: async (email) => ({ userId: '42' }),
};

export const config = new ServerConfig(clientConfig, runtimeConfig);
