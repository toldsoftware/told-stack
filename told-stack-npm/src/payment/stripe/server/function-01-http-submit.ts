import { buildHttpFunction, buildQueue, build_runFunction, build_createFunctionJson, buildTable } from "../../../core/azure-functions/function-builder";
import { HttpFunctionRequest, HttpFunctionResponse, HttpFunctionRequest_ClientInfo } from "../../../core/types/functions";
import { FunctionTemplateConfig, ServerConfigType, HttpFunction_BindingData, ProcessQueue, StripeCheckoutTable } from "../config/server-config";
import { CheckoutSubmitRequestBody, CheckoutSubmitResult } from "../config/client-config";
import { CheckoutStatus } from "../../common/checkout-types";

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
    const serverCheckoutId = config.createServerCheckoutId();
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
