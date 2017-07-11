import { CheckoutOptions, CheckoutResult } from "../../common/checkout-types";
import { ClientConfig as LoggerClientConfig } from "../../../core/logger/config/client-config";

export type CheckoutEventType = 'Open' | 'ResultChange';

export class ClientConfig {
    stripePublishableKey: string;
    checkoutOptions: CheckoutOptions;
    logCheckoutEvent: (type: CheckoutEventType, data: Object) => void;

    constructor(loggerConfig: LoggerClientConfig ) {

    }
}