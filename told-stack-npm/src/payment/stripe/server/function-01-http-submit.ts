import { buildFunction_http, build_runFunction_http, build_createFunctionJson, build_binding } from "../../../core/azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, StripeCheckoutTable } from "../config/server-config";
import { CheckoutSubmitRequestBody, CheckoutSubmitResult } from "../config/client-config";
import { CheckoutStatus } from "../../common/checkout-types";

import { uuid as _uuid } from "../../../core/utils/uuid";

export const deps = {
    getServerCheckoutId: () => _uuid.v4(),
};

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_http({
        route: config.submit_route
    })
        .bindings(t => ({
            outProcessQueue: build_binding<ProcessQueue>(config.getBinding_processQueue())
        }));
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_http(buildFunction, (config: ServerConfigType, context, req) => {

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
    const serverCheckoutId = deps.getServerCheckoutId();
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
