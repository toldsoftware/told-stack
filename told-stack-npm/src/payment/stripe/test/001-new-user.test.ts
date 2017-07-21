import { createTest } from "../../../core/testing/integration-testing";
import { createCheckoutSubmitRequestBody } from "./_common";
import { CheckoutSubmitResult, CheckoutStatusResult, ClientConfig } from "../config/client-config";
import { CheckoutSubmitRequestBody, StripeCustomerLookupTable, StripeUserLookupTable, StripeCheckoutTable, ServerConfig, FunctionTemplateConfig } from "../config/server-config";
import { delay } from "../../../core/utils/delay";
import { CheckoutStatus, PaymentStatus, DeliverableStatus, DeliverableStatus_ExecutionResult } from "../../common/checkout-types";
import { TestConfig } from "../config/test-config";

export const test_001_new_user = createTest<TestConfig>(({ clientConfig, functionConfig, serverConfig, options }) => ({
    name: `A New User Should Purchase a Product (${options.shouldUseNewProduct ? 'New Product' : ''})`,
    run: async (assertInner, load, apiFetch, notifyFailure) => {
        let pass = true;
        const assert = <T>(title: string, actual: T, expected?: T) => {
            if (!assertInner(title, actual, expected)) {
                pass = false;
                notifyFailure();
            }
        };

        const testCode = `001newuser${options.shouldUseNewProduct ? 'P' : ''}`;
        const clientCheckoutId = `test_${testCode}_${Date.now()}`;
        const email = `${clientCheckoutId}@toldstack.com`;
        const request = createCheckoutSubmitRequestBody(clientCheckoutId, testCode, email, options.shouldUseNewProduct);

        const response = await apiFetch<CheckoutSubmitResult, CheckoutSubmitRequestBody>(
            clientConfig.getSubmitTokenUrl(),
            request,
        );

        assert('Response should have serverCheckoutId', response.serverCheckoutId);

        let statusResponse: CheckoutStatusResult = null;
        let attempts = 0;
        let d = 500;
        while (attempts < 4) {
            attempts++;

            await delay(d *= 2);
            statusResponse = await apiFetch<CheckoutStatusResult>(
                clientConfig.getCheckoutStatusUrl(email, response.serverCheckoutId)
            );

            if (statusResponse.deliverableStatus_executionResult === DeliverableStatus_ExecutionResult.Enabled) {
                break;
            }
        }

        assert('Checkout status should be submitted', statusResponse.checkoutStatus, CheckoutStatus.Submitted);
        assert('Payment status should be submitted', statusResponse.paymentStatus, PaymentStatus.PaymentSuceeded);
        assert('Deliverable status should be enabled', statusResponse.deliverableStatus, DeliverableStatus.Enabled);
        assert('Deliverable execution result should be enabled', statusResponse.deliverableStatus_executionResult, DeliverableStatus_ExecutionResult.Enabled);

        // Storage
        const userLookup = await load<StripeUserLookupTable>(
            functionConfig.getBinding_stripeUserLookupTable_fromTrigger({
                emailHash: serverConfig.getEmailHash(email),
                serverCheckoutId: response.serverCheckoutId,
            }));

        const customerLookup = await load<StripeCustomerLookupTable>(
            functionConfig.getBinding_stripeCustomerLookupTable_fromTrigger({
                emailHash: serverConfig.getEmailHash(email),
                serverCheckoutId: response.serverCheckoutId,
            }));

        const checkoutTable = await load<StripeCheckoutTable>(
            functionConfig.getBinding_stripeCheckoutTable_fromTrigger({
                emailHash: serverConfig.getEmailHash(email),
                serverCheckoutId: response.serverCheckoutId,
            }));

        assert('User Lookup Table should exist', userLookup);
        assert('Customer Lookup Table should exist', customerLookup);

        assert('Customer Checkout Table should have request', checkoutTable.request, request.body);
        assert('Customer Checkout Table should have correct user', checkoutTable.userId, userLookup.userId);
        assert('Customer Checkout Table should have correct customer', checkoutTable.customer.id, customerLookup.customerId);
        assert('Customer Checkout Table should have correct clientCheckoutId', checkoutTable.clientCheckoutId, clientCheckoutId);

        assert('Final checkout status should be submitted', checkoutTable.checkoutStatus, CheckoutStatus.Submitted);
        assert('Final payment status should be submitted', checkoutTable.paymentStatus, PaymentStatus.PaymentSuceeded);
        assert('Final deliverable status should be enabled', checkoutTable.deliverableStatus, DeliverableStatus.Enabled);
        assert('Final deliverable execution result should be enabled', checkoutTable.deliverableStatus_executionResult, DeliverableStatus_ExecutionResult.Enabled);

        return { result: pass ? 'pass' : 'fail' };
    },
}));
