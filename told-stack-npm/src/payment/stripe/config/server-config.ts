import { ClientConfig, CheckoutSubmitRequestBody } from "./client-config";
import { CheckoutStatus, SubscriptionStatus } from "../../common/checkout-types";
import { Stripe, StripeCharge, StripeCustomer, StripePlan, StripeSubscription } from "./stripe";

export interface FunctionTemplateConfig {
    storageConnection: string;

    submit_route: string;
    status_route: string;
    webhook_route: string;

    processQueue_queueName: string;

    stripeCheckoutTable_tableName: string;
    stripeCheckoutTable_partitionKey_fromTrigger: string;
    stripeCheckoutTable_rowKey_fromTrigger: string;

}

export interface HttpFunction_BindingData {
    // Doesn't work
    // DateTime: string;
    // ['rand-guid']: string;
}

export interface HttpFunction_BindingData_Status extends ProcessQueue {
}

export interface ProcessQueue {
    request: CheckoutSubmitRequestBody;
    emailHash: string;
    serverCheckoutId: string;
}

export interface StripeCheckoutTable {
    PartitionKey: string;
    RowKey: string;
    status: CheckoutStatus;
    subscriptionStatus?: SubscriptionStatus;

    customer?: StripeCustomer,
    charge?: StripeCharge,
    plan?: StripePlan,
    subscription?: StripeSubscription,

    request: CheckoutSubmitRequestBody;
    timeRequested: number;
    timeSucceeded?: number;
    timeFailed?: number;
    error?: string;
}

export interface StripeWebhookRequestBody {

}

export interface ServerConfigType extends StripeCheckoutRuntimeOptions {
    getStripeSecretKey(): string;

    getEmailHash(email: string): string;

    stripeCheckoutTable_tableName: string;
    getStripeCheckoutPartitionKey(emailHash: string, serverCheckoutId: string): string;
    getStripeCheckoutRowKey(emailHash: string, serverCheckoutId: string): string;
}

export interface StripeCheckoutRuntimeOptions {
    processRequest: (request: CheckoutSubmitRequestBody) => Promise<void>;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    storageConnection = this.default_storageConnectionString_AppSettingName;

    submit_route = this.clientConfig.submit_route;
    status_route = this.clientConfig.status_route;
    webhook_route = 'api/stripe-webhook';

    processQueue_queueName = 'stripe-checkout-request';

    stripeCheckoutTable_tableName = `stripe`;
    stripeCheckoutTable_partitionKey_fromTrigger = `{emailHash}`;
    stripeCheckoutTable_rowKey_fromTrigger = `{serverCheckoutId}`;

    getStripeCheckoutPartitionKey(emailHash: string, serverCheckoutId: string) {
        return emailHash;
    }

    getStripeCheckoutRowKey(emailHash: string, serverCheckoutId: string) {
        return serverCheckoutId;
    }

    constructor(
        private runtimeOptions: StripeCheckoutRuntimeOptions,
        private clientConfig: ClientConfig,
        private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING',
        private stripeSecretKey_AppSettingName = 'STRIPE_SECRET_KEY',
    ) {

    }

    getEmailHash = this.clientConfig.getEmailHash;
    processRequest = this.runtimeOptions.processRequest;

    getStripeSecretKey() {
        return process.env[this.stripeSecretKey_AppSettingName];
    }
}