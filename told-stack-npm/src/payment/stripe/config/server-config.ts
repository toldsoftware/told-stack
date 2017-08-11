import { ClientConfig, CheckoutSubmitRequestBody } from "./client-config";
import { CheckoutStatus, SubscriptionStatus, CheckoutResult } from "../../common/checkout-types";
import { Stripe, StripeCharge, StripeCustomer, StripePlan, StripeSubscription, StripeEvent } from "../lib/stripe";
import { QueueBinding, TableBinding } from "../../../core/types/functions";
import { createTrigger } from "../../../core/azure-functions/function-builder";
import { AccountServerConfig } from "../../../core/account/config/server-config";
import { SessionInfo, SessionTable } from "../../../core/account/config/types";
import { EmailProviderConfig } from "../../../core/providers/email-provider";
export { SessionTable };
export { CheckoutSubmitRequestBody };

export interface FunctionTemplateConfig {
    submit_route: string;
    status_route: string;
    webhook_route: string;

    getBinding_processQueue(): QueueBinding;
    getBinding_stripeCheckoutTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding;
    getBinding_stripeCustomerLookupTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding;
    getBinding_stripeUserLookupTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding;

    getBinding_stripeWebhookQueue(): QueueBinding

    getBinding_sessionTable(trigger: { sessionToken: string }): TableBinding;
    // getBinding_accountTable(): TableBinding;
}

export const processQueueTrigger = createTrigger({
    emailHash: '',
    serverCheckoutId: '',
    sessionToken: '',
});

export interface QueueTrigger_NoSession {
    emailHash: string;
    serverCheckoutId: string;
}

export const statusHttpTrigger = processQueueTrigger;

export interface ProcessQueue {
    emailHash: string;
    serverCheckoutId: string;
    sessionToken: string;

    request: CheckoutSubmitRequestBody;
}

export interface StripeCheckoutTable extends CheckoutResult {
    PartitionKey: string;
    RowKey: string;

    emailHash: string;
    clientCheckoutId: string;
    serverCheckoutId: string;
    request: CheckoutSubmitRequestBody;

    userId?: string,
    customer?: StripeCustomer,
    charge?: StripeCharge,
    plan?: StripePlan,
    subscription?: StripeSubscription,

    newSessionInfo: SessionInfo;


    // timeRequested: number;
    // timeSucceeded?: number;
    // timeFailed?: number;
    error?: string;
    warning?: string;
    warningData?: any;
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
    emailConfig: EmailProviderConfig;
    accountConfig: AccountServerConfig;

    runtime: StripeCheckoutRuntimeConfig;

    getStripeSecretKey(): string;
    getStripeWebhookSigningSecret(): string;

    getEmailHash(email: string): string;
    // createServerCheckoutId(): string;

    getBinding_accountTable(): TableBinding;
    getBinding_stripeCheckoutTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding;
    getBinding_stripeCustomerLookupTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding;
}

// export enum GetUserResultError {
//     NoError = '',
//     EmailBelongsToAnotherUser_RequireLogin = 'EmailBelongsToAnotherUser_RequireLogin',
// }

export interface StripeCheckoutRuntimeConfig {
    executeRequest: (request: CheckoutSubmitRequestBody, lastSessionToken: string) => Promise<{ newSessionInfo?: SessionInfo }>;
    // lookupUser_sessionToken(userToken: string): Promise<{ userId: string, isAnonymousUser: boolean }>;
    // lookupUser_stripeEmail(stripeEmail: string): Promise<{ userId: string }>;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    // The SDK Depends on this setting (It cannot be changed with ensuring the SDK requires it to be set)
    private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING';
    private storageConnection = this.default_storageConnectionString_AppSettingName;

    constructor(
        private clientConfig: ClientConfig,
        private runtimeConfig: StripeCheckoutRuntimeConfig,
        public accountConfig: AccountServerConfig,
        public emailConfig: EmailProviderConfig,
        private stripeSecretKey_AppSettingName = 'STRIPE_SECRET_KEY',
        private stripeWebhookSigningSecret_AppSettingName = 'STRIPE_WEBHOOK_SIGNING_SECRET',
    ) {

    }

    runtime = this.runtimeConfig;

    submit_route = this.clientConfig.submit_route;
    status_route = this.clientConfig.status_route;
    webhook_route = 'webhook/stripe';

    getBinding_processQueue(): QueueBinding {
        return {
            queueName: 'stripe-checkout-request',
            connection: this.storageConnection
        };
    }

    getBinding_stripeWebhookQueue(): QueueBinding {
        return {
            queueName: 'stripe-webhook',
            connection: this.storageConnection
        };
    }

    getBinding_stripeCheckoutTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding {
        return {
            tableName: 'stripe',
            partitionKey: trigger.emailHash && `${trigger.emailHash}` || undefined,
            rowKey: trigger.serverCheckoutId && `${trigger.serverCheckoutId}` || undefined,
            connection: this.storageConnection
        };
    }

    getBinding_stripeCustomerLookupTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding {
        return {
            tableName: 'stripe',
            partitionKey: `${trigger.emailHash}`,
            rowKey: `lookup-email-customer`,
            connection: this.storageConnection
        };
    }


    getBinding_stripeUserLookupTable_fromTrigger(trigger: QueueTrigger_NoSession): TableBinding {
        return {
            tableName: 'stripe',
            partitionKey: `${trigger.emailHash}`,
            rowKey: `lookup-email-user`,
            connection: this.storageConnection
        };
    }

    getBinding_sessionTable = this.accountConfig.getBinding_sessionTable_fromSessionToken;
    getBinding_accountTable = this.accountConfig.getBinding_accountTable;


    getEmailHash = this.clientConfig.getEmailHash;

    getStripeSecretKey() {
        return process.env[this.stripeSecretKey_AppSettingName];
    }

    getStripeWebhookSigningSecret() {
        return process.env[this.stripeWebhookSigningSecret_AppSettingName];
    }
}