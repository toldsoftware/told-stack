// // Code Time
// import 'stripe-node';
// const Stripe: StripeNode.StripeExport = require('stripe');
// export type StripeCharge = StripeNode.charges.ICharge;
// export type StripeCustomer = StripeNode.customers.ICustomer;
// export type StripePlan = StripeNode.plans.IPlan;
// export type StripeSubscription = StripeNode.subscriptions.ISubscription;
// export type StripeEvent = StripeNode.events.IEvent;

// export type StripeWithMissing = StripeNode.Stripe & {
//     webhooks: {
//         constructEvent(webhookBody: string | StripeEvent, stripeSignature: string, endpointSecret: string): StripeEvent;
//     }
// }
// // END Code Time

// Runtime Build
import { StripeConstructor } from './stripe.types';
const Stripe = require('stripe') as StripeConstructor;

export { Stripe };
export * from './stripe.types';
// END Runtime Build
