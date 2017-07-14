import { ServerConfig } from "@told/stack/src/payment/stripe/config/server-config";
import { clientConfig } from "./stripe-client";
import { processRequest } from '../../../src-server/src/process-stripe-checkout';

const runtimeConfig = {
    processRequest
};

export const config = new ServerConfig(clientConfig,runtimeConfig);
