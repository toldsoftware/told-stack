import { HttpFunctionRequest, HttpFunctionResponse, HttpFunctionRequest_ClientInfo } from "../../../core/types/functions";
import { FunctionTemplateConfig, ServerConfigType, HttpFunction_BindingData, ProcessQueue, StripeCheckoutTable } from "../config/server-config";
import { CheckoutSubmitRequestBody, CheckoutSubmitResult } from "../config/client-config";
import { CheckoutStatus } from "../../common/checkout-types";
import { uuid } from "../../../core/utils/uuid";
import { buildHttpFunction, buildQueue, build_runFunction, build_createFunctionJson, buildTable } from "../../../core/azure-functions/function-builder";


function buildFunction(config: FunctionTemplateConfig) {
    return buildHttpFunction({
        route: config.submit_route
    })
        .bindings({
            outProcessQueue: buildQueue<ProcessQueue>({
                direction: 'out',
                queueName: config.processQueue_queueName,
                storageConnection: config.storageConnection
            }),
            // outStripeCheckoutTable: buildTable<StripeCheckoutTable>({
            //     direction: 'out',
            //     tableName: config.stripeCheckoutTable_tableName,
            //     storageConnection: config.storageConnection
            // }),
        })
        ;
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

// export function createFunctionJson(config: FunctionTemplateConfig) {
//     return {
//         bindings: [
//             {
//                 name: "req",
//                 type: "httpTrigger",
//                 direction: "in",
//                 authLevel: "anonymous",
//                 route: config.submit_route
//             },
//             {
//                 name: "res",
//                 type: "http",
//                 direction: "out"
//             },
//             {
//                 name: "outProcessQueue",
//                 type: "queue",
//                 direction: "out",
//                 queueName: config.processQueue_queueName,
//                 connection: config.storageConnection
//             },
//             // {
//             //     name: "outStripeCheckoutTable",
//             //     type: "table",
//             //     direction: "out",
//             //     tableName: config.stripeCheckoutTable_tableName,
//             //     connection: config.storageConnection
//             // },
//         ],
//         disabled: false
//     };
// }

// export async function runFunction(config: ServerConfigType, context: {
//     log: typeof console.log,
//     done: () => void,
//     res: HttpFunctionResponse<CheckoutSubmitResult>,
//     bindingData: HttpFunction_BindingData,
//     bindings: {
//         outProcessQueue: ProcessQueue,
//         outStripeCheckoutTable: StripeCheckoutTable,
//     }
// }, req: HttpFunctionRequest) {
export const runFunction = build_runFunction(buildFunction, (config: ServerConfigType, context, req) => {

    context.log('START');

    // Handle Max Queue Size (64kb) -> Put in a blob
    context.log('req', { req });

    const request = JSON.parse(req.body) as CheckoutSubmitRequestBody;

    context.log('request', { request });

    if (!request.token) {
        context.res = {
            body: {
                error: 'No Token Sent',
                checkoutStatus: CheckoutStatus.Submission_Failed,
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
    const checkoutStatus = CheckoutStatus.Submitted;

    context.bindings.outProcessQueue = {
        request,
        emailHash,
        serverCheckoutId,
    };

    // context.bindings.outStripeCheckoutTable = {
    //     PartitionKey: config.getStripeCheckoutPartitionKey(emailHash, serverCheckoutId),
    //     RowKey: config.getStripeCheckoutRowKey(emailHash, serverCheckoutId),
    //     request,
    //     status,
    //     timeRequested: Date.now(),
    // };

    context.log(`Stored in Queue`);

    context.res = {
        body: {
            checkoutStatus,
            serverCheckoutId,
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
});
