import { CheckoutOptions, CheckoutResult } from "../../common/checkout-types";
import { ClientConfig as LoggerClientConfig } from "../../../core/logger/config/client-config";
import { assignPartial } from "../../../core/utils/objects";
import { StripeToken, StripeTokenArgs } from "../client/stripe-checkout-access";
import { hashEmail_partial } from "../../../core/utils/hash";

export type CheckoutEventType = 'Open' | 'ResultChange';

export interface ClientRuntimeOptions {
    logCheckoutEvent: (type: CheckoutEventType, data: Object) => void;
}

export interface ClientConfigOptions {
    stripePublishableKey: string;
    checkoutOptions: Partial<CheckoutOptions>;
    getUserToken: () => Promise<{ userToken: string }>;

    getSubmitTokenUrl(): string;
    getCheckoutStatusUrl(email: string, serverCheckoutId: string): string;
    getStripeChargeMetadata(options: CheckoutOptions): { [key: string]: string | number };
    getStripeChargeStatementDescriptor(options: CheckoutOptions): string;
    getStripeChargeStatementDescriptor_subscription(options: CheckoutOptions): string;
}

export interface CheckoutSubmitRequestBody {
    userToken: string;
    clientCheckoutId: string;
    token: StripeToken;
    args: StripeTokenArgs;
    checkoutOptions: CheckoutOptions;
    metadata: { [key: string]: string | number }
    statementDescriptor: string;
    statementDescriptor_subscription: string;
}

export interface CheckoutSubmitResult extends Partial<CheckoutResult> {
}

export interface CheckoutStatusResult extends Partial<CheckoutResult> {
}

export class ClientConfig implements ClientConfigOptions {
    stripePublishableKey: string;
    checkoutOptions: CheckoutOptions;

    domain = '/';
    submit_route = 'api/stripe-checkout-submit';
    status_route_partial = 'api/stripe-checkout-status';
    get status_route() { return `${this.status_route_partial}/{emailHash}/{serverCheckoutId}`; }

    constructor(
        private options: Partial<ClientConfigOptions>,
        public getUserToken: () => Promise<{ userToken: string }>,

    ) {
        assignPartial(this, options);
    }

    getSubmitTokenUrl(): string {
        return `${this.domain}${this.submit_route}`;
    }

    getCheckoutStatusUrl(email: string, serverCheckoutId: string): string {
        return `${this.domain}${this.status_route_partial}/${this.getEmailHash(email)}/${serverCheckoutId}`;
    }

    getEmailHash(email: string): string {
        return hashEmail_partial(email);
    }

    getStripeChargeMetadata(options: CheckoutOptions): { [key: string]: string | number } {
        return {
            ...options.user,
            ...options.product,
        };
    }

    getStripeChargeStatementDescriptor(options: CheckoutOptions): string {
        return `${options.business.statementDescriptor} ${options.product.statementDescriptor}`.substr(0, 22);
    }


    getStripeChargeStatementDescriptor_subscription(options: CheckoutOptions): string {
        return `${options.business.statementDescriptor} ${options.product.statementDescriptor_subscription}`.substr(0, 22);
    }

}