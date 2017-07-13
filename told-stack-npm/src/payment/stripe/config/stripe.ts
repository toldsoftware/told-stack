import 'stripe-node';
const Stripe: StripeNode.StripeExport = require('stripe');
export { Stripe };
export type StripeCharge = StripeNode.charges.ICharge;
export type StripeCustomer = StripeNode.customers.ICustomer;
export type StripePlan = StripeNode.plans.IPlan;
export type StripeSubscription = StripeNode.subscriptions.ISubscription;