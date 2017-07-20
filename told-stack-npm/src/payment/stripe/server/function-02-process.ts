import { buildFunction_common, build_binding, build_runFunction_common, build_createFunctionJson } from "../../../core/azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable, StripeCheckoutRuntimeConfig, StripeCustomerLookupTable, StripeUserLookupTable, processQueueTrigger, GetUserResultError } from "../config/server-config";
import { SubscriptionStatus, PaymentStatus, DeliverableStatus, CheckoutStatus } from "../../common/checkout-types";
import { saveEntity as _saveEntity } from "../../../core/utils/azure-storage-sdk/tables";
import { Stripe as _Stripe, StripeCustomer } from "../config/stripe";

export const deps = {
    saveEntity: _saveEntity,
    Stripe: _Stripe,
};

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_common(processQueueTrigger)
        .bindings(t => ({
            inProcessQueueTrigger: build_binding<ProcessQueue>(config.getBinding_processQueue()),
            inStripeCheckoutTable: build_binding<StripeCheckoutTable>(config.getBinding_stripeCheckoutTable_fromTrigger(t)),
            inStripeCustomerLookupTable: build_binding<StripeCustomerLookupTable>(config.getBinding_stripeCustomerLookupTable_fromTrigger(t)),
            inStripeUserLookupTable: build_binding<StripeUserLookupTable>(config.getBinding_stripeUserLookupTable_fromTrigger(t)),
            outStripeCustomerLookupTable: build_binding<StripeCustomerLookupTable>(config.getBinding_stripeCustomerLookupTable_fromTrigger(t)),
            outStripeUserLookupTable: build_binding<StripeUserLookupTable>(config.getBinding_stripeUserLookupTable_fromTrigger(t)),
        }));
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_common(buildFunction, async (config: ServerConfigType, context) => {

    context.log('START');

    const q = context.bindings.inProcessQueueTrigger;

    const saveData = async (data: Partial<StripeCheckoutTable>) => {
        context.log('Processing', { paymentpaymentStatus: data.paymentStatus, data });

        // Log History
        const b = config.getBinding_stripeCheckoutTable_fromTrigger(q);

        await deps.saveEntity(
            b.tableName,
            b.partitionKey,
            `${b.rowKey}_at-${Date.now()}`,
            { ...data, isLog: true } as any);

        // Save Main
        await deps.saveEntity(
            b.tableName,
            b.partitionKey,
            b.rowKey,
            data as any);
    };

    // Restart the process only if the user required login
    if (context.bindings.inStripeCheckoutTable) {
        if (context.bindings.inStripeCheckoutTable.checkoutStatus === CheckoutStatus.Submission_Rejected_LoginAndResubmit) {
            // Continue
            await saveData({
                checkoutStatus: CheckoutStatus.Submitted,
            });
        } else {
            return context.done({ error: 'Entity Already Exists', q });
        }
    }

    try {
        await saveData({
            paymentStatus: PaymentStatus.Processing,
        });

        // Execute Charge With Stripe
        const stripe = deps.Stripe(config.getStripeSecretKey());

        // Lookup Existing Customer using Email
        const customerLookup = context.bindings.inStripeCustomerLookupTable;
        const userLookup = context.bindings.inStripeCustomerLookupTable;

        // if !User && !Customer => New Customer & New User
        // ??? if User & !Customer => Invalid (Unknown Customer) => New Customer => Attach to User 
        // ? if !User && Customer => Unclaimed Customer (Previous Payment with No User Account Attached) => New User => Attach to User
        // ? if User && Customer => Verify User is Correct => Existing Customer

        let customer: StripeCustomer = null;
        let userId: string = null;

        if (!customerLookup && !userLookup) {

            // Create Customer and User
            const newCustomer = await stripe.customers.create({
                source: q.request.token.id,
                email: q.request.token.email,
            });

            customer = newCustomer;
            const userResult = await config.runtime.getOrCreateCurrentUserId(q.request.token.email);
            if (userResult.error) {
                if (userResult.error === GetUserResultError.EmailBelongsToAnotherUser_RequireLogin) {
                    await saveData({
                        checkoutStatus: CheckoutStatus.Submission_Rejected_LoginAndResubmit,
                        paymentStatus: PaymentStatus.Paused,
                    });
                    return context.done({ error: 'User Requires Login', q, userResult });
                }

                return context.done({ error: 'Unknown User Error', q, userResult });
            }

            userId = userResult.userId;

            // Save
            context.bindings.outStripeCustomerLookupTable = { customerId: customer.id };
            context.bindings.outStripeUserLookupTable = { userId };

        } else {
            // TODO: FINISH THIS
            if (!!true) {
                throw 'Not Implemented';
            }

            // // Verify ownership
            // if (userLookup.customerId !== customerLookup.customerId) {
            //     // If the customer or user is unknown
            //     // If the customer or user do not match
            // }

            // // Get Existing Customer
            // const existingCustomerId = customerLookup.customerId
            // const existingCustomer = await stripe.customers.retrieve(existingCustomerId);
        }

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

    // throw 'Not Implemented';

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
});
