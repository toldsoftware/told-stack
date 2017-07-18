import { ClientConfig, CheckoutSubmitRequestBody } from "./client-config";
import { CheckoutStatus, SubscriptionStatus, CheckoutResult } from "../../common/checkout-types";
import { Stripe, StripeCharge, StripeCustomer, StripePlan, StripeSubscription, StripeEvent } from "./stripe";
import { QueueBinding, TableBinding } from "../../../core/types/functions";
import { createTrigger } from "../../../core/azure-functions/function-builder";
export { CheckoutSubmitRequestBody };

export interface FunctionTemplateConfig {
    // storageConnection: string;

    submit_route: string;
    status_route: string;
    webhook_route: string;

    getBinding_processQueue(): QueueBinding;
    getBinding_stripeCheckoutTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding;
    getBinding_stripeCustomerLookupTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding;
    getBinding_stripeUserLookupTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding;

    // processQueue_queueName: string;
    // webhookQueue_queueName: string;

    // stripeCheckoutTable_tableName: string;
    // stripeCheckoutTable_partitionKey_fromTrigger: string;
    // stripeCheckoutTable_rowKey_fromTrigger: string;

    // stripeCustomerLookupTable_tableName: string;
    // stripeCustomerLookupTable_partitionKey_fromTrigger: string;
    // stripeCustomerLookupTable_rowKey_fromTrigger: string;

    // stripeUserLookupTable_tableName: string;
    // stripeUserLookupTable_partitionKey_fromTrigger: string;
    // stripeUserLookupTable_rowKey_fromTrigger: string;
}

export interface HttpFunction_BindingData {
    // Doesn't work
    // DateTime: string;
    // ['rand-guid']: string;
}

export interface HttpFunction_BindingData_Status extends ProcessQueue {
}

export const processQueueTrigger = createTrigger({
    emailHash: '',
    serverCheckoutId: '',
});

export interface ProcessQueue {
    request: CheckoutSubmitRequestBody;
    emailHash: string;
    serverCheckoutId: string;
}

export interface StripeCheckoutTable extends CheckoutResult {
    PartitionKey: string;
    RowKey: string;

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

export interface StripeCustomerLookupTable {
    customerId: string;
}

export interface StripeUserLookupTable {
    userId: string;
}

export interface StripeWebhookData extends StripeEvent {

}

export interface StripeWebhookRequestBody extends StripeEvent {

}

export interface StripeWebhookQueue {
    body: StripeWebhookRequestBody;
    stripeSignature: string;
}

export interface ServerConfigType {
    runtime: StripeCheckoutRuntimeConfig;

    getStripeSecretKey(): string;
    getStripeWebhookSigningSecret(): string;

    getEmailHash(email: string): string;
    // createServerCheckoutId(): string;

    getBinding_stripeCheckoutTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding;

    // stripeCheckoutTable_tableName: string;
    // getStripeCheckoutPartitionKey(emailHash: string, serverCheckoutId: string): string;
    // getStripeCheckoutRowKey(emailHash: string, serverCheckoutId: string): string;
}

export interface StripeCheckoutRuntimeConfig {
    executeRequest: (request: CheckoutSubmitRequestBody) => Promise<void>;

    lookupUserByUserToken(userToken: string): Promise<{ userId: string }>;
    createUserId(): Promise<string>;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    runtime = this.runtimeConfig;

    private storageConnection = this.default_storageConnectionString_AppSettingName;

    submit_route = this.clientConfig.submit_route;
    status_route = this.clientConfig.status_route;
    webhook_route = 'webhook/stripe';

    getBinding_processQueue(): QueueBinding {
        return {
            queueName: 'stripe-checkout-request',
            connection: this.storageConnection
        };
    }

    getBinding_stripeCheckoutTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding {
        return {
            tableName: 'stripe',
            partitionKey: `${trigger.emailHash}`,
            rowKey: `${trigger.serverCheckoutId}`,
            connection: this.storageConnection
        };
    }

    getBinding_stripeCustomerLookupTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding {
        return {
            tableName: 'stripe',
            partitionKey: `${trigger.emailHash}`,
            rowKey: `lookup-email-customer`,
            connection: this.storageConnection
        };
    }


    getBinding_stripeUserLookupTable_fromTrigger(trigger: typeof processQueueTrigger): TableBinding {
        return {
            tableName: 'stripe',
            partitionKey: `${trigger.emailHash}`,
            rowKey: `lookup-email-user`,
            connection: this.storageConnection
        };
    }

    // processQueue_queueName = 'stripe-checkout-request';
    // webhookQueue_queueName = 'stripe-webhook';

    // stripeCheckoutTable_tableName = `stripe`;
    // stripeCheckoutTable_partitionKey_fromTrigger = `{emailHash}`;
    // stripeCheckoutTable_rowKey_fromTrigger = `{serverCheckoutId}`;

    // stripeCustomerLookupTable_tableName = `stripe`;
    // stripeCustomerLookupTable_partitionKey_fromTrigger = `{emailHash}`;
    // stripeCustomerLookupTable_rowKey_fromTrigger = `lookup-email-customer`;

    // stripeUserLookupTable_tableName = `stripe`;
    // stripeUserLookupTable_partitionKey_fromTrigger = `{emailHash}`;
    // stripeUserLookupTable_rowKey_fromTrigger = `lookup-email-user`;

    getStripeCheckoutPartitionKey(emailHash: string, serverCheckoutId: string) {
        return emailHash;
    }

    getStripeCheckoutRowKey(emailHash: string, serverCheckoutId: string) {
        return serverCheckoutId;
    }

    constructor(
        private clientConfig: ClientConfig,
        private runtimeConfig: StripeCheckoutRuntimeConfig,
        private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING',
        private stripeSecretKey_AppSettingName = 'STRIPE_SECRET_KEY',
        private stripeWebhookSigningSecret_AppSettingName = 'STRIPE_WEBHOOK_SIGNING_SECRET',
    ) {

    }

    getEmailHash = this.clientConfig.getEmailHash;
    // createServerCheckoutId(): string {
    //     return uuid.v4();
    // }

    getStripeSecretKey() {
        return process.env[this.stripeSecretKey_AppSettingName];
    }

    getStripeWebhookSigningSecret() {
        return process.env[this.stripeWebhookSigningSecret_AppSettingName];
    }
}