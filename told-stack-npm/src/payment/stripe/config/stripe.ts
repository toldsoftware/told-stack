// Won't run
import 'stripe-node';
const Stripe: StripeNode.StripeExport = require('stripe');


// namespace StripeNode {
//     export type Stripe = any;

//     export namespace charges {
//         export type ICharge = any;
//     }
//     export namespace customers {
//         export type ICustomer = any;
//     }
//     export namespace plans {
//         export type IPlan = any;
//     }
//     export namespace subscriptions {
//         export type ISubscription = any;
//     }
//     export namespace events {
//         export type IEvent = any;
//     }
// }
// const Stripe = require('stripe');


export { Stripe };

export type StripeCharge = StripeNode.charges.ICharge;
export type StripeCustomer = StripeNode.customers.ICustomer;
export type StripePlan = StripeNode.plans.IPlan;
export type StripeSubscription = StripeNode.subscriptions.ISubscription;
export type StripeEvent = StripeNode.events.IEvent;

export type StripeWithMissing = StripeNode.Stripe & {
    webhooks: {
        constructEvent(webhookBody: string | StripeEvent, stripeSignature: string, endpointSecret: string): StripeEvent;
    }
}
