import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable } from "../config/server-config";
import { insertOrMergeTableRow_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { saveRow } from "../../../core/utils/azure-storage-sdk/tables";
import { CheckoutStatus, SubscriptionStatus } from "../../common/checkout-types";
import { Stripe } from "../config/stripe";



// Queue Trigger: Update Request Queue
// Table In-Out: Changing Blob Singleton Check
// Queue Out: Update Execute Queue Only Once Per Stale Timeout

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inProcessQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.processQueue_queueName,
                connection: config.storageConnection
            },
            // {
            //     name: "inStripeCheckoutTable",
            //     type: "table",
            //     direction: "in",
            //     tableName: config.stripeCheckoutTable_tableName,
            //     partitionKey: config.stripeCheckoutTable_partitionKey_fromTrigger,
            //     rowKey: config.stripeCheckoutTable_rowKey_fromTrigger,
            //     connection: config.storageConnection
            // },
            // {
            //     name: "outStripeCheckoutTable",
            //     type: "table",
            //     direction: "out",
            //     tableName: config.stripeCheckoutTable_tableName,
            //     partitionKey: config.stripeCheckoutTable_partitionKey_fromTrigger,
            //     rowKey: config.stripeCheckoutTable_rowKey_fromTrigger,
            //     connection: config.storageConnection
            // },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    bindingData: {
        insertionTime: Date,
    },
    bindings: {
        inProcessQueue: ProcessQueue,
        // inStripeCheckoutTable: StripeCheckoutTable,
        // outStripeCheckoutTable: StripeCheckoutTable,
    }
}) {
    context.log('START');


    const q = context.bindings.inProcessQueue;
    const saveData = async (data: Partial<StripeCheckoutTable>) => {
        context.log('Processing', { status: data.status, data });

        // Log History
        await saveRow(
            config.stripeCheckoutTable_tableName,
            config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
            `${config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId)}_at-${Date.now()}`,
            { ...data, isLog: true } as any);

        // Save Main
        await saveRow(
            config.stripeCheckoutTable_tableName,
            config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
            config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId),
            data as any);
    };

    try {
        await saveData({
            status: CheckoutStatus.ProcessingPayment,
        });

        // Execute Charge With Stripe
        const stripe = Stripe(config.getStripeSecretKey());
        const customer = await stripe.customers.create({
            source: q.request.token.id,
            email: q.request.token.email,
        });

        await saveData({
            status: CheckoutStatus.ProcessingPaymentCustomerCreated,
            customer,
        });

        const charge = await stripe.charges.create({
            customer: customer.id,
            amount: q.request.checkoutOptions.product.amountCents,
            currency: 'usd',
            description: q.request.checkoutOptions.product.description,
            metadata: q.request.metadata,
            statement_descriptor: q.request.statementDescriptor,
        });

        await saveData({
            status: CheckoutStatus.ProcessingPaymentSuceeded,
            charge,
        });

        // Subscribe
        await saveData({
            subscriptionStatus: SubscriptionStatus.Subscribing,
        });

        const planId = `${q.request.checkoutOptions.product.subscriptionPlanId_noPrice}-m-${q.request.checkoutOptions.product.monthlyAmountCents}`;
        const foundPlan = await stripe.plans.retrieve(planId);

        const plan = foundPlan || await stripe.plans.create({
            amount: q.request.checkoutOptions.product.monthlyAmountCents,
            currency: 'usd',
            interval: 'month',
            name: q.request.checkoutOptions.product.subscriptionPlanName,
            id: planId,
            trial_period_days: 30,
            statement_descriptor: q.request.statementDescriptor_subscription,
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            plan: plan.id,
            metadata: q.request.metadata,
        });

        await saveData({
            subscriptionStatus: SubscriptionStatus.TrialPeriod,
            plan,
            subscription,
        });

    } catch (error) {
        await saveData({
            status: CheckoutStatus.ProcessingPaymentFailed,
            error,
            timeFailed: Date.now(),
        });
        context.log('ERROR');
        context.done();
        return;
    }

    try {
        // Process Request
        await saveData({
            status: CheckoutStatus.ProcessingExecuting,
        });

        await config.processRequest(q.request);

        await saveData({
            status: CheckoutStatus.ProcessingSucceeded,
            timeSucceeded: Date.now(),
        });
    } catch (error) {
        await saveData({
            status: CheckoutStatus.ProcessingExecutionFailed,
            error,
            timeFailed: Date.now(),
        });
        context.log('ERROR');
        context.done();
        return;
    }

    context.log('DONE');
    context.done();
}