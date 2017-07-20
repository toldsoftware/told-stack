export type StripeConstructor = (stripeSecretKey: string) => Stripe;

export interface Stripe {
    charges: StripeCharges;
    customers: StripeCustomers;
    webhooks: StripeWebhooks;
}

export type StripeTokenId = string;
export type StripeCustomerId = string;
export type StripeChargeId = string;
export type StripeCurrencyCode = 'usd';
export type StripeEmail = string;
export type StripeSourceId = StripeCustomerId | StripeTokenId;

export interface StripeMetadata {
    [name: string]: string | number;
}

export interface StripeCharges {
    create(args: {
        customer: StripeCustomerId;
        amount: number;
        currency: StripeCurrencyCode;
        description: string;
        metadata: StripeMetadata;
        statement_descriptor: string;
    }): StripeCharge;
}

export interface StripeCharge {
    id: StripeChargeId;
}

export interface StripeCustomers {
    create(args: {
        source: StripeSourceId;
        email: StripeEmail;
    }): StripeCustomer;
    retrieve(customerId: StripeCustomerId): StripeCustomer;
}

export interface StripeCustomer {
    id: StripeCustomerId;
}

export interface StripeSubscription {

}

export interface StripePlan {

}

export interface StripeWebhooks {
    constructEvent(requestBody: string, stripeSignature: string, signingSecret: string): StripeEvent;
}

export interface StripeEvent {

}