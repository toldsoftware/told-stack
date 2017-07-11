import { ScriptLoader } from "../../../core/utils/script-loader";
import { InstanceLoader } from "../../../core/utils/instance-loader";

// https://stripe.com/docs/checkout#integration-custom

export interface StripeCheckout {
    configure(options: StripeConfigureOptions & StripeRequiredOptions & StripeRecommendedOptions & StripeAdditionalOptions): StripeCheckoutHandler;
}

export interface StripeCheckoutHandler {
    open(options: StripeRequiredOptions & StripeRecommendedOptions & StripeAdditionalOptions): void;
}

export interface StripeConfigureOptions {
    // Stripe Publishable Key
    key: string;
}

export interface StripeRequiredOptions {
    // Callback
    token?: (token: StripeToken, args: StripeTokenArgs) => void;
}

// export export interface TokenResult {
//     token: StripeToken;
//     args: StripeTokenArgs;
// }

export interface StripeRecommendedOptions {
    // Business Image
    image?: string;
    // Business Name
    name?: string;
    // Product Description
    description?: string;
    // Amount in Cents
    amount?: number;
    // Language
    locale?: 'auto' | string;
    // Zip Code Required
    zipCode?: boolean;
    // Billing Address Required
    billingAddress?: boolean;
}

export interface StripeAdditionalOptions {
    // Currency Code (Default: USD)
    currency?: string;
    // Payment Button Label
    panelLabel?: string;
    // Shipping Addres Required
    shippingAddress?: boolean;
    // Prefilled Email
    email?: string;
    // Start Button Text  (Simple Only)
    // label?: string;
    // Remember Me Allowed
    allowRememberMe?: boolean;
    // Bitcoin Payment Allowed
    bitcoin?: boolean;
    // Opened Callback
    opened?: () => void;
    // Closed Callback
    closed?: () => void;
}

export interface StripeToken {
    id: string;
    email: string;
}

export interface StripeTokenArgs {

    // Billing name and address
    billing_name?: string;
    billing_address_country?: string;
    billing_address_zip?: string;
    billing_address_state?: string;
    billing_address_line1?: string;
    billing_address_city?: string;
    billing_address_country_code?: string;

    // Shipping name and address
    shipping_name?: string;
    shipping_address_country?: string;
    shipping_address_zip?: string;
    shipping_address_state?: string;
    shipping_address_line1?: string;
    shipping_address_city?: string;
    shipping_address_country_code?: string;
}


declare var StripeCheckout: StripeCheckout;

const scriptLoader = new ScriptLoader({
    url: 'https://checkout.stripe.com/checkout.js',
    scriptElementId: 'StripeCheckout',
    getInstance: () => {
        return StripeCheckout;
    }
});

export class StripeCheckoutAccess {

    _handler: StripeCheckoutHandler;

    constructor(private stripePublishableKey: string) { }

    private handlerLoader = new InstanceLoader(async () => {
        console.log('StripeCheckoutProcess.handlerLoader START');
        const s = await scriptLoader.load();
        console.log('StripeCheckoutProcess.handlerLoader LOADED');
        const handler = await s.configure({ key: this.stripePublishableKey });
        console.log('StripeCheckoutProcess.handlerLoader END');
        return handler;
    });

    prepare = async () => {
        this._handler = await this.handlerLoader.instance;
        return;
    }

    // This must be a direct call to handler.open (It cannot be async or will get popup-blocked)
    open = (options: {
        tokenCallback: (token: StripeToken, args: StripeTokenArgs) => void,
        recommendedOptions?: StripeRecommendedOptions,
        additionalOptions?: StripeAdditionalOptions
    }) => {
        const handler = this._handler;

        if (!handler) {
            throw 'The Stripe Checkout Handler must be loaded before Open is Clicked';
        }

        handler.open({
            token: options.tokenCallback,
            ...options.recommendedOptions,
            ...options.additionalOptions,
        });
    };
}