import { StripeConstructor, Stripe, StripeCharges, StripeCustomers, StripeWebhooks } from "./stripe.types";

// export function mockStripe(mocks: {
//     charges: StripeCharges,
//     customers: StripeCustomers,
//     webhooks: StripeWebhooks,
// }): StripeConstructor {
//     return () => ({
//         charges,
//         customers,
//         webhooks,
//     } as Stripe);
// }

export type PartialPartial<T> = {
    [P in keyof T]?: Partial<T[P]>;
};

export function mockStripeConstructor(mock: PartialPartial<Stripe>): StripeConstructor {
    return () => mock as Stripe;
}