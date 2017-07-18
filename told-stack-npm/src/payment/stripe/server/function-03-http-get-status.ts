import { HttpFunctionRequest, HttpFunctionResponse, HttpFunctionRequest_ClientInfo } from "../../../core/types/functions";
import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, HttpFunction_BindingData_Status, StripeCheckoutTable } from "../config/server-config";
import { CheckoutSubmitRequestBody, CheckoutSubmitResult } from "../config/client-config";
import { CheckoutStatus } from "../../common/checkout-types";

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                direction: "in",
                authLevel: "anonymous",
                route: config.status_route
            },
            {
                name: "res",
                type: "http",
                direction: "out"
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
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse<CheckoutSubmitResult>,
    bindingData: HttpFunction_BindingData_Status,
    bindings: {
        inStripeCheckoutTable: StripeCheckoutTable,
    }
}, req: HttpFunctionRequest) {
    context.log('START');

    const data = context.bindings.inStripeCheckoutTable;

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
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
};
