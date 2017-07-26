import { CheckoutOptions, CheckoutResult } from "../../common/checkout-types";
import { ClientConfig as LoggerClientConfig } from "../../../core/logger/config/client-config";
import { assignPartial } from "../../../core/utils/objects";
import { StripeToken, StripeTokenArgs } from "../client/stripe-checkout-access";
import { hashEmail_partial } from "../../../core/utils/hash";
import { SessionInfo_Client } from "../../../core/account/config/types";

export type CheckoutEventType = 'Open' | 'ResultChange';

export interface ClientRuntimeConfig {
    logCheckoutEvent: (type: CheckoutEventType, data: Object) => void;
}

export interface ClientConfigOptions extends Partial<ClientConfig> {
    stripePublishableKey: string;
    checkoutOptions: Partial<CheckoutOptions>;
    getSessionInfo: () => Promise<SessionInfo_Client>;
}

export interface ClientConfig {
    stripePublishableKey: string;
    checkoutOptions: Partial<CheckoutOptions>;
    getSessionInfo: () => Promise<SessionInfo_Client>;

    getServerUrl_submit: () => string;
    getServerUrl_status: (email: string, serverCheckoutId: string) => string;
    getStripeChargeMetadata: (options: CheckoutOptions) => { [key: string]: string | number };
    getStripeChargeStatementDescriptor: (options: CheckoutOptions) => string;
    getStripeChargeStatementDescriptor_subscription: (options: CheckoutOptions) => string;
}

export interface CheckoutSubmitRequestBody {
    sessionInfo: SessionInfo_Client;
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

export class ClientConfig implements ClientConfig {
    stripePublishableKey: string;
    checkoutOptions: Partial<CheckoutOptions>;

    domain = '/';
    submit_route = 'api/stripe-checkout-submit';
    status_route_partial = 'api/stripe-checkout-status';
    get status_route() { return `${this.status_route_partial}/{emailHash}/{serverCheckoutId}`; }

    constructor(
        private options: ClientConfigOptions
    ) {
        assignPartial(this as ClientConfigOptions, options);
    }

    getSessionInfo = this.options.getSessionInfo;

    getServerUrl_submit = (): string => {
        return `${this.domain}${this.submit_route}`;
    }

    getServerUrl_status = (email: string, serverCheckoutId: string): string => {
        return `${this.domain}${this.status_route_partial}/${this.getEmailHash(email)}/${serverCheckoutId}`;
    }

    getEmailHash = (email: string): string => {
        return hashEmail_partial(email);
    }

    getStripeChargeMetadata = (options: CheckoutOptions): { [key: string]: string | number } => {
        return {
            ...options.user,
            ...options.product,
        };
    }

    getStripeChargeStatementDescriptor = (options: CheckoutOptions): string => {
        return `${options.business.statementDescriptor} ${options.product.statementDescriptor}`.substr(0, 22);
    }


    getStripeChargeStatementDescriptor_subscription = (options: CheckoutOptions): string => {
        return `${options.business.statementDescriptor} ${options.product.statementDescriptor_subscription}`.substr(0, 22);
    }

}