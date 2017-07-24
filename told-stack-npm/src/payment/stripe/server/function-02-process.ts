import { buildFunction_common, build_binding, build_runFunction_common, build_createFunctionJson } from "../../../core/azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable, StripeCheckoutRuntimeConfig, StripeCustomerLookupTable, StripeUserLookupTable, processQueueTrigger } from "../config/server-config";
import { SubscriptionStatus, PaymentStatus, DeliverableStatus, CheckoutStatus, DeliverableStatus_ExecutionResult, CheckoutPausedReason } from "../../common/checkout-types";
import { saveEntity as _saveEntity } from "../../../core/utils/azure-storage-sdk/tables";
import { Stripe as _Stripe, StripeCustomer, StripePlan } from "../lib/stripe";

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
        try {
            // Log History
            const b = config.getBinding_stripeCheckoutTable_fromTrigger(q);
            const changedRowKey = `${b.rowKey}_LOG-${Date.now()}`;

            // context.log('saveData START', { paymentStatus: data.paymentStatus, data, b, changedRowKey });

            await deps.saveEntity(
                b.tableName,
                b.partitionKey,
                changedRowKey,
                { ...data, isLog: true } as any);

            // Save Main
            await deps.saveEntity(
                b.tableName,
                b.partitionKey,
                b.rowKey,
                data as any);

            // context.log('saveData END', { paymentStatus: data.paymentStatus, data, b, changedRowKey });

        } catch (error) {
            return context.done({ message: 'saveData FAILED', error });
        }
    };

    // Restart the process only if the process had been paused
    if (context.bindings.inStripeCheckoutTable) {
        if (context.bindings.inStripeCheckoutTable.checkoutStatus === CheckoutStatus.Submission_Paused) {
            // Continue
            await saveData({
                checkoutStatus: CheckoutStatus.Submitted,
            });
        } else {
            return context.done({ error: 'Entity Already Exists', q });
        }
    } else {
        // New Request
        await saveData({
            emailHash: context.bindingData.emailHash,
            serverCheckoutId: context.bindingData.serverCheckoutId,
            clientCheckoutId: q.request.clientCheckoutId,
            request: q.request,
            checkoutStatus: CheckoutStatus.Submitted,
        });
    }

    const stripe = deps.Stripe(config.getStripeSecretKey());
    let customer: StripeCustomer = null;
    let userId: string = null;

    // Verify the user owns the stripe email (has authority over that stripe email)
    try {

        // A user will always have a sessionToken and userId (even anonymous users - this is done immediately upon page load)
        const userBySessionToken = await config.runtime.lookupUser_sessionToken(q.request.sessionToken);
        //const ownerOfStripeEmail = await config.runtime.lookupUser_stripeEmail(q.request.token.email);
        const ownerOfStripeEmail = context.bindings.inStripeUserLookupTable;

        if (!userBySessionToken) {
            await saveData({
                checkoutStatus: CheckoutStatus.Submission_Paused,
                checkoutPausedReason: CheckoutPausedReason.SessionNotFound_CreateNewSession
            });
            return context.done({ error: 'Session User Not Found', q });

        } else if (userBySessionToken.isAnonymousUser && ownerOfStripeEmail) {
            await saveData({
                checkoutStatus: CheckoutStatus.Submission_Paused,
                checkoutPausedReason: CheckoutPausedReason.EmailBelongsToAccount_LoginAndResubmit
            });
            return context.done({ error: 'User Requires Login', q });

        } else if (userBySessionToken.userId !== ownerOfStripeEmail.userId) {
            await saveData({
                checkoutStatus: CheckoutStatus.Submission_Paused,
                checkoutPausedReason: CheckoutPausedReason.EmailBelongsToOtherUser_LoginToCorrectAccount
            });
            return context.done({ error: 'User does not own the email', q });
        }

        userId = userBySessionToken.userId;

    } catch (err) {
        await saveData({
            checkoutStatus: CheckoutStatus.Submission_Paused,
            checkoutPausedReason: CheckoutPausedReason.UnknownUserError_CreateNewSession,
            error: err
        });
        return context.done({ error: 'User does not own the email', q });
    }

    try {
        // Execute Charge With Stripe
        await saveData({
            paymentStatus: PaymentStatus.Processing,
        });

        // Lookup Existing Customer using Email
        const customerLookup = context.bindings.inStripeCustomerLookupTable;

        if (!customerLookup) {
            // New Customer

            // Create Customer with Stripe
            const newCustomer = await stripe.customers.create({
                source: q.request.token.id,
                email: q.request.token.email,
            });

            customer = newCustomer;

            // Save
            context.bindings.outStripeCustomerLookupTable = { customerId: customer.id };
            context.bindings.outStripeUserLookupTable = { userId };

        } else { //else if (customerLookup) {

            // Existing Customer
            try {
                customer = await stripe.customers.retrieve(customerLookup.customerId);

                if (!customer) {
                    throw 'No Customer Retrieved';
                }
            } catch (err) {
                throw { error: 'Stripe Failed to Find Customer by Customer Id', innerError: err };
            }
        }

        await saveData({
            // paymentStatus: PaymentStatus.CustomerCreated,
            customer,
            userId,
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
            // timeFailed: Date.now(),
        });

        return context.done({ message: 'ProcessingPaymentFailed', error });
    }

    try {
        // Subscribe
        await saveData({
            subscriptionStatus: SubscriptionStatus.Processing,
        });

        const planId = `${q.request.checkoutOptions.product.subscriptionPlanId_noPrice}-m-${q.request.checkoutOptions.product.monthlyAmountCents}`;
        let foundPlan: StripePlan = null;
        try {
            foundPlan = await stripe.plans.retrieve(planId);
        } catch (err) {
            // No Plan Found?
        }

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
            subscriptionStatus: SubscriptionStatus.Subscribed_TrialPeriod,
            plan,
            subscription,
        });

    } catch (error) {
        await saveData({
            // paymentStatus: PaymentStatus.PaymentFailed,
            subscriptionStatus: SubscriptionStatus.SubscriptionFailed,
            error,
            // timeFailed: Date.now(),
        });

        return context.done({ message: 'SubscriptionFailed', error });
    }

    try {
        // Process Request
        // await saveData({
        //     deliverableStatus: DeliverableStatus.Processing,
        // });

        await saveData({
            deliverableStatus: DeliverableStatus.Enabled,
        });

        await config.runtime.executeRequest(q.request);

        await saveData({
            deliverableStatus_executionResult: DeliverableStatus_ExecutionResult.Enabled,
            // timeSucceeded: Date.now(),
        });
    } catch (error) {
        await saveData({
            deliverableStatus_executionResult: DeliverableStatus_ExecutionResult.Error,
            error,
            // timeFailed: Date.now(),
        });

        return context.done({ message: 'ProcessingExecutionFailed', error });
    }

    context.log('DONE');
    context.done();
});
