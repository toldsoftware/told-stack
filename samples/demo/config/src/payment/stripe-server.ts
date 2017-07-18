import { ServerConfig, StripeCheckoutRuntimeConfig } from "@told/stack/src/payment/stripe/config/server-config";
import { clientConfig } from "./stripe-client";
import { processRequest } from '../../../src-server/src/process-stripe-checkout';

const runtimeConfig: StripeCheckoutRuntimeConfig = {
    processRequest,
    lookupUserByUserToken: async (token) => ({ userId: '42' }),
};

export const config = new ServerConfig(clientConfig, runtimeConfig);
