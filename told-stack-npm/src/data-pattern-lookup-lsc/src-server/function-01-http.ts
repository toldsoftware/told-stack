import { DataUpdateConfig, DataKey, FunctionTemplateConfig, UpdateRequestQueueMessage } from "../src-config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../core/types/functions";

// Http Request: Handle Update Request
// Blob In: Read Old Lookup Blob Value
// Queue Out: Update Request Queue
// Http Response: Return Old Lookup Value with Short TTL

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                direction: "in",
                authLevel: "anonymous",
                route: config.http_route
            },
            {
                name: "res",
                type: "http",
                direction: "out"
            },
            {
                name: "inLookupBlob",
                type: "blob",
                direction: "in",
                path: config.lookupBlob_path
            },
            {
                name: "outUpdateRequestQueue",
                type: "queue",
                direction: "out",
                queueName: config.updateRequestQueue_queueName
            },
        ],
        disabled: false
    };
}

export function runFunction(config: DataUpdateConfig, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: any,
    bindings: {
        inLookupBlob: string,
        outUpdateRequestQueue: UpdateRequestQueueMessage,
    }
}, req: HttpFunctionRequest) {
    const dataKey = config.getKeyFromRequest(req, context.bindingData);

    // Set Update Request Queue
    context.bindings.outUpdateRequestQueue = dataKey;

    // Return Current Blob Value with Short TTL
    const lookup = context.bindings.inLookupBlob

    if (!lookup) {
        // Deal with missing lookup (First time request?)
        context.res = {
            status: 400,
            body: `Not Ready Yet: Try again in ${config.timePollSeconds} Seconds`,
            headers: {
                'Cache-Control': `public, max-age=${config.timeExtendSeconds}`
            }
        };
    } else {
        // Return Old Lookup
        context.res = {
            body: lookup,
            headers: {
                'Cache-Control': `public, max-age=${config.timeExtendSeconds}`
            }
        };
    }

    context.done();
};
