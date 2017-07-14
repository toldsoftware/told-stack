import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable, StripeWebhookQueue } from "../config/server-config";
import { insertOrMergeTableEntity_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { saveEntity, doesEntityExist } from "../../../core/utils/azure-storage-sdk/tables";
import { CheckoutStatus, SubscriptionStatus } from "../../common/checkout-types";
import { Stripe, StripeWithMissing } from "../config/stripe";


export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inWebhookQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.webhookQueue_queueName,
                connection: config.storageConnection
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: (error?: any) => void,
    bindingData: {
        insertionTime: Date,
    },
    bindings: {
        inWebhookQueue: StripeWebhookQueue,
    }
}) {
    context.log('START');

    const q = context.bindings.inWebhookQueue;
    const stripe = Stripe(config.getStripeSecretKey()) as StripeWithMissing;
    const event = stripe.webhooks.constructEvent(JSON.stringify(q.body), q.stripeSignature, config.getStripeWebhookEndpointSecret());

    // Validate event
    if (event) {

    }

    // const q = context.bindings.inProcessQueue;

    // if (context.bindings.inStripeCheckoutTable) {
    //     return context.done({ error: 'Entity Already Exists', q });
    // }

    // // Verify Entity Does not exist to Prevent Replay
    // // const exists = await doesEntityExist(
    // //     config.stripeCheckoutTable_tableName,
    // //     config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
    // //     config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId),
    // // );

    // // if (exists) {
    // //     return context.done({ error: 'Entity Already Exists', q });
    // // }

    // const saveData = async (data: Partial<StripeCheckoutTable>) => {
    //     context.log('Processing', { status: data.status, data });

    //     // Log History
    //     await saveEntity(
    //         config.stripeCheckoutTable_tableName,
    //         config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
    //         `${config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId)}_at-${Date.now()}`,
    //         { ...data, isLog: true } as any);

    //     // Save Main
    //     await saveEntity(
    //         config.stripeCheckoutTable_tableName,
    //         config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
    //         config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId),
    //         data as any);
    // };

    // try {
    //     await saveData({
    //         status: CheckoutStatus.ProcessingPayment,
    //     });

    //     // Execute Charge With Stripe
    //     const stripe = Stripe(config.getStripeSecretKey());
    //     const customer = await stripe.customers.create({
    //         source: q.request.token.id,
    //         email: q.request.token.email,
    //     });

    //     await saveData({
    //         status: CheckoutStatus.ProcessingPaymentCustomerCreated,
    //         customer,
    //     });

    //     const charge = await stripe.charges.create({
    //         customer: customer.id,
    //         amount: q.request.checkoutOptions.product.amountCents,
    //         currency: 'usd',
    //         description: q.request.checkoutOptions.product.description,
    //         metadata: q.request.metadata,
    //         statement_descriptor: q.request.statementDescriptor,
    //     });

    //     await saveData({
    //         status: CheckoutStatus.ProcessingPaymentSuceeded,
    //         charge,
    //     });

    //     // Subscribe
    //     await saveData({
    //         subscriptionStatus: SubscriptionStatus.Subscribing,
    //     });

    //     const planId = `${q.request.checkoutOptions.product.subscriptionPlanId_noPrice}-m-${q.request.checkoutOptions.product.monthlyAmountCents}`;
    //     const foundPlan = await stripe.plans.retrieve(planId);

    //     const plan = foundPlan || await stripe.plans.create({
    //         amount: q.request.checkoutOptions.product.monthlyAmountCents,
    //         currency: 'usd',
    //         interval: 'month',
    //         name: q.request.checkoutOptions.product.subscriptionPlanName,
    //         id: planId,
    //         trial_period_days: 30,
    //         statement_descriptor: q.request.statementDescriptor_subscription,
    //     });

    //     const subscription = await stripe.subscriptions.create({
    //         customer: customer.id,
    //         plan: plan.id,
    //         metadata: q.request.metadata,
    //     });

    //     await saveData({
    //         subscriptionStatus: SubscriptionStatus.TrialPeriod,
    //         plan,
    //         subscription,
    //     });

    // } catch (error) {
    //     await saveData({
    //         status: CheckoutStatus.ProcessingPaymentFailed,
    //         error,
    //         timeFailed: Date.now(),
    //     });

    //     return context.done({ message: 'ProcessingPaymentFailed', error });
    // }

    // try {
    //     // Process Request
    //     await saveData({
    //         status: CheckoutStatus.ProcessingExecuting,
    //     });

    //     await config.processRequest(q.request);

    //     await saveData({
    //         status: CheckoutStatus.ProcessingSucceeded,
    //         timeSucceeded: Date.now(),
    //     });
    // } catch (error) {
    //     await saveData({
    //         status: CheckoutStatus.ProcessingExecutionFailed,
    //         error,
    //         timeFailed: Date.now(),
    //     });

    //     return context.done({ message: 'ProcessingExecutionFailed', error });
    // }

    context.log('DONE');
    context.done();
}