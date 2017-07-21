import { buildFunction_http, build_binding, build_createFunctionJson, build_runFunction_http } from "../../../core/azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable, statusHttpTrigger } from "../config/server-config";
import { CheckoutSubmitRequestBody, CheckoutSubmitResult } from "../config/client-config";
import { CheckoutStatus } from "../../common/checkout-types";

export const deps = {
};

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_http({
        route: config.status_route,
        bindingData: statusHttpTrigger
    })
        .bindings(t => ({
            inStripeCheckoutTable: build_binding<StripeCheckoutTable>(config.getBinding_stripeCheckoutTable_fromTrigger(t))
        }));
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_http(buildFunction, (config: ServerConfigType, context, req) => {
    const data = context.bindings.inStripeCheckoutTable;
    context.log('START', { ParitionKey: data.PartitionKey, RowKey: data.RowKey });

    if (!data) {
        context.res = {
            body: {
                error: 'No Status Found Yet, Try Again Soon',
            },
            headers: {
                'Content-Type': 'application/json',
            }
        };

        context.log('DONE');
        context.done();
        return;
    }

    context.res = {
        body: {
            checkoutStatus: data.checkoutStatus,
            paymentStatus: data.paymentStatus,
            subscriptionStatus: data.subscriptionStatus,
            deliverableStatus: data.deliverableStatus,
            deliverableStatus_executionResult: data.deliverableStatus_executionResult,
            error: data.error,
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
});
