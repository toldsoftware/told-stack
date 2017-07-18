import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable, StripeCheckoutRuntimeConfig, StripeCustomerLookupTable, StripeUserLookupTable } from "../config/server-config";
import { SubscriptionStatus, PaymentStatus, DeliverableStatus } from "../../common/checkout-types";

import { insertOrMergeTableEntity_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { saveEntity, doesEntityExist } from "../../../core/utils/azure-storage-sdk/tables";
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
            {
                name: "inStripeCheckoutTable",
                type: "table",
                direction: "in",
                tableName: config.stripeCheckoutTable_tableName,
                partitionKey: config.stripeCheckoutTable_partitionKey_fromTrigger,
                rowKey: config.stripeCheckoutTable_rowKey_fromTrigger,
                connection: config.storageConnection
            },
            {
                name: "inStripeCustomerLookupTable",
                type: "table",
                direction: "in",
                tableName: config.stripeCustomerLookupTable_tableName,
                partitionKey: config.stripeCustomerLookupTable_partitionKey_fromTrigger,
                rowKey: config.stripeCustomerLookupTable_rowKey_fromTrigger,
                connection: config.storageConnection
            },
            {
                name: "outStripeCustomerLookupTable",
                type: "table",
                direction: "out",
                tableName: config.stripeCustomerLookupTable_tableName,
                partitionKey: config.stripeCustomerLookupTable_partitionKey_fromTrigger,
                rowKey: config.stripeCustomerLookupTable_rowKey_fromTrigger,
                connection: config.storageConnection
            },
            {
                name: "inStripeUserLookupTable",
                type: "table",
                direction: "in",
                tableName: config.stripeUserLookupTable_tableName,
                partitionKey: config.stripeUserLookupTable_partitionKey_fromTrigger,
                rowKey: config.stripeUserLookupTable_rowKey_fromTrigger,
                connection: config.storageConnection
            },
            {
                name: "outStripeUserLookupTable",
                type: "table",
                direction: "out",
                tableName: config.stripeUserLookupTable_tableName,
                partitionKey: config.stripeUserLookupTable_partitionKey_fromTrigger,
                rowKey: config.stripeUserLookupTable_rowKey_fromTrigger,
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
        inProcessQueue: ProcessQueue,
        inStripeCheckoutTable: StripeCheckoutTable,
        inStripeCustomerLookupTable: StripeCustomerLookupTable,
        outStripeCustomerLookupTable: StripeCustomerLookupTable,
        inStripeUserLookupTable: StripeUserLookupTable,
        outStripeUserLookupTable: StripeUserLookupTable,
    }
}) {
    context.log('START');


    const q = context.bindings.inProcessQueue;

    // TODO: What if the process needs to be restarted, like if userToken was late supplied
    if (context.bindings.inStripeCheckoutTable) {
        return context.done({ error: 'Entity Already Exists', q });
    }

    const saveData = async (data: Partial<StripeCheckoutTable>) => {
        context.log('Processing', { paymentpaymentStatus: data.paymentStatus, data });

        // Log History
        await saveEntity(
            config.stripeCheckoutTable_tableName,
            config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
            `${config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId)}_at-${Date.now()}`,
            { ...data, isLog: true } as any);

        // Save Main
        await saveEntity(
            config.stripeCheckoutTable_tableName,
            config.getStripeCheckoutPartitionKey(q.emailHash, q.serverCheckoutId),
            config.getStripeCheckoutRowKey(q.emailHash, q.serverCheckoutId),
            data as any);
    };

    try {
        await saveData({
            paymentStatus: PaymentStatus.Processing,
        });

        // Execute Charge With Stripe
        const stripe = Stripe(config.getStripeSecretKey());

        // Lookup Existing Customer using Email
        const customerLookup = context.bindings.inStripeCustomerLookupTable;
        const userLookup = context.bindings.inStripeCustomerLookupTable;

        // TODO: FINISH THIS
        if (!!true) {
            throw 'Not Implmented';
        }

        // if !User && !Customer => New Customer
        // if User & !Customer => Invalid (Unknown Customer) => New Customer
        // if !User && Customer => Unclaimed Customer (Previous Payment with No User Account Attached)
        // if User && Customer => Verify User is Correct => Existing Customer

        if (customerLookup) {

            // Verify ownership
            if (userLookup.customerId !== customerLookup.customerId) {
                // If the customer or user is unknown
                // If the customer or user do not match
            }

            // Get Existing Customer
            const existingCustomerId = customerLookup.customerId
            const existingCustomer = await stripe.customers.retrieve(existingCustomerId);
        }

        // Create Customer
        const customer = await stripe.customers.create({
            source: q.request.token.id,
            email: q.request.token.email,
        });

        await saveData({
            // paymentStatus: PaymentStatus.CustomerCreated,
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
            paymentStatus: PaymentStatus.PaymentSuceeded,
            charge,
        });

    } catch (error) {
        await saveData({
            paymentStatus: PaymentStatus.PaymentFailed,
            error,
            timeFailed: Date.now(),
        });

        return context.done({ message: 'ProcessingPaymentFailed', error });
    }

    throw 'Not Implemented';

    // try {

    //     // Subscribe
    //     await saveData({
    //         subscriptionStatus: SubscriptionStatus.Processing,
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
    //         subscriptionStatus: SubscriptionStatus.Subscribed_TrialPeriod,
    //         plan,
    //         subscription,
    //     });

    // } catch (error) {
    //     await saveData({
    //         // paymentStatus: PaymentStatus.PaymentFailed,
    //         subscriptionStatus: SubscriptionStatus.SubscriptionFailed,
    //         error,
    //         timeFailed: Date.now(),
    //     });

    //     return context.done({ message: 'SubscriptionFailed', error });
    // }

    // try {
    //     // Process Request
    //     await saveData({
    //         deliverableStatus: DeliverableStatus.Processing,
    //     });

    //     await config.processRequest(q.request);

    //     await saveData({
    //         paymentStatus: PaymentStatus.ProcessingSucceeded,
    //         timeSucceeded: Date.now(),
    //     });
    // } catch (error) {
    //     await saveData({
    //         deliverableStatus: DeliverableStatus.,
    //         paymentStatus: PaymentStatus.ProcessingExecutionFailed,
    //         error,
    //         timeFailed: Date.now(),
    //     });

    //     return context.done({ message: 'ProcessingExecutionFailed', error });
    // }

    // context.log('DONE');
    // context.done();
}