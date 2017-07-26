import { ServerConfig, StripeCheckoutRuntimeConfig } from "@told/stack/src/payment/stripe/config/server-config";
import { clientConfig } from "./stripe-client";
import { executeRequest } from '../../../src-server/src/execute-stripe-checkout';
import { accountConfig } from "../core/account-server";

const runtimeConfig: StripeCheckoutRuntimeConfig = {
    executeRequest,
    // lookupUser_sessionToken: async (sessionToken) => ({ userId: '42', isAnonymousUser: false }),
    // lookupUser_stripeEmail: async (stripeEmail) => ({ userId: '42' }),
};

export const config = new ServerConfig(clientConfig, runtimeConfig, accountConfig);
