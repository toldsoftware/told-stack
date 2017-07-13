import { HttpFunctionRequest, HttpFunctionResponseTyped, HttpFunctionRequest_ClientInfo } from "../../../core/types/functions";
import { FunctionTemplateConfig, ServerConfigType, HttpFunction_BindingData, ProcessQueue, StripeCheckoutTable } from "../config/server-config";
import { CheckoutSubmitRequestBody, CheckoutSubmitResult } from "../config/client-config";
import { CheckoutStatus } from "../../common/checkout-types";
import { uuid } from "../../../core/utils/uuid";

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                direction: "in",
                authLevel: "anonymous",
                route: config.submit_route
            },
            {
                name: "res",
                type: "http",
                direction: "out"
            },
            {
                name: "outProcessQueue",
                type: "queue",
                direction: "out",
                queueName: config.processQueue_queueName,
                connection: config.storageConnection
            },
            {
                name: "outStripeCheckoutTable",
                type: "table",
                direction: "out",
                tableName: config.stripeCheckoutTable_tableName,
                connection: config.storageConnection
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponseTyped<CheckoutSubmitResult>,
    bindingData: HttpFunction_BindingData,
    bindings: {
        outProcessQueue: ProcessQueue,
        outStripeCheckoutTable: StripeCheckoutTable,
    }
}, req: HttpFunctionRequest) {
    context.log('START');

    // Handle Max Queue Size (64kb) -> Put in a blob
    const request = JSON.parse(req.body) as CheckoutSubmitRequestBody;

    if (!request.token) {
        context.res = {
            body: {
                error: 'No Token Sent',
                status: CheckoutStatus.ProcessingExecutionFailed,
            },
            headers: {
                'Content-Type': 'application/json',
            }
        };

        context.log('DONE');
        context.done();
        return;
    }

    const emailHash = config.getEmailHash(request.token.email);
    const serverCheckoutId = uuid.v4();
    const status = CheckoutStatus.ProcessingQueued;

    context.bindings.outProcessQueue = {
        request,
        emailHash,
        serverCheckoutId,
    };

    context.bindings.outStripeCheckoutTable = {
        PartitionKey: config.getStripeCheckoutPartitionKey(emailHash, serverCheckoutId),
        RowKey: config.getStripeCheckoutRowKey(emailHash, serverCheckoutId),
        request,
        status,
        timeRequested: Date.now(),
    };

    context.log(`Stored in Queue`);

    context.res = {
        body: {
            status,
            serverCheckoutId,
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
};
