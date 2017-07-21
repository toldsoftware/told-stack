import { CheckoutSubmitResult, CheckoutStatusResult } from "../../config/client-config";
import { CheckoutSubmitRequestBody, StripeUserLookupTable, StripeCustomerLookupTable, StripeCheckoutTable } from "../../config/server-config";
import { TestContext } from "../../../../core/testing/integration-testing";
import { TestConfig } from "../../config/test-config";
import { exponentialBackoff } from "../../../../core/utils/time";
import { DeliverableStatus_ExecutionResult, CheckoutStatus, PaymentStatus, DeliverableStatus } from "../../../common/checkout-types";

export async function verifyPurchase(testContext: TestContext, testConfig: TestConfig, data: {
    email: string,
    clientCheckoutId: string,
    request: { body: CheckoutSubmitRequestBody }
}) {
    const { assert, load, apiFetch, notifyFailure } = testContext;
    const { clientConfig, functionConfig, serverConfig, options } = testConfig;
    const { email, clientCheckoutId, request } = data;

    const response = await apiFetch<CheckoutSubmitResult, CheckoutSubmitRequestBody>(
        clientConfig.getSubmitTokenUrl(),
        request,
    );

    assert('Response should have serverCheckoutId', response.serverCheckoutId);

    const statusResponse = await exponentialBackoff(async () => {
        const r = await apiFetch<CheckoutStatusResult>(
            clientConfig.getCheckoutStatusUrl(email, response.serverCheckoutId)
        );

        if (r.paymentStatus === PaymentStatus.PaymentFailed) {
            throw r.error;
        }

        return r;
    }, r => r.deliverableStatus_executionResult === DeliverableStatus_ExecutionResult.Enabled, 500);

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

}