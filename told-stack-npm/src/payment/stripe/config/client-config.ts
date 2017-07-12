import { CheckoutOptions, CheckoutResult } from "../../common/checkout-types";
import { ClientConfig as LoggerClientConfig } from "../../../core/logger/config/client-config";
import { assignPartial } from "../../../core/utils/objects";

export type CheckoutEventType = 'Open' | 'ResultChange';

export interface ClientConfigOptions {
    stripePublishableKey: string;
    checkoutOptions: Partial<CheckoutOptions>;
}

export interface ClientRuntimeOptions{
    logCheckoutEvent: (type: CheckoutEventType, data: Object) => void;
}

export class ClientConfig implements ClientConfigOptions {
    stripePublishableKey: string;
    checkoutOptions: CheckoutOptions;

    constructor(private options: Partial<ClientConfigOptions>) {
        assignPartial(this, options);
    }
}