import { DataUpdateConfig, DataKey, FunctionTemplateConfig, UpdateRequestQueueMessage, ChangeBlob, LookupBlob, HttpFunction_BindingData } from "../src-config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../../core/types/functions";
import { readBlob } from "../../../core/utils/azure-storage/blobs";

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
            // Input Blobs Binding doesn't work if it may not exist
            // {
            //     name: "inLookupBlob",
            //     type: "blob",
            //     direction: "in",
            //     path: config.lookupBlob_path,
            //     connection: config.lookupBlob_connection
            // },
            {
                name: "outUpdateRequestQueue",
                type: "queue",
                direction: "out",
                queueName: config.updateRequestQueue_queueName,
                connection: config.updateRequestQueue_connection
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: DataUpdateConfig, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_BindingData,
    bindings: {
        // inLookupBlob: LookupBlob,
        outUpdateRequestQueue: UpdateRequestQueueMessage,
    }
}, req: HttpFunctionRequest) {
    context.log('START');

    const dataKey = config.getKeyFromRequest(req, context.bindingData);
    // const lookup = context.bindings.inLookupBlob;
    const lookup = await readBlob<LookupBlob>(dataKey.containerName, config.getLookupBlobName(dataKey.blobName));
    
    context.log('Lookup', { lookup });

    // If the blob value is not stale
    // Return Current Blob Value with Long TTL
    const remainingTtl = lookup && lookup.startTime
        && (lookup.startTime + config.timeToLiveSeconds * 1000 - Date.now());

    if (remainingTtl > 0) {

        // Return Old Lookup (Long TTL)
        context.res = {
            body: lookup,
            headers: {
                'Cache-Control': `public, max-age=${remainingTtl}`
            }
        };
        context.done();
        return;
    }

    // Set Update Request Queue
    context.bindings.outUpdateRequestQueue = { ...dataKey, startTime: Date.now() };

    // Return Current Blob Value with Short TTL

    if (!lookup) {
        // Deal with missing lookup (First time request?)
        context.res = {
            status: 400,
            body: `Not Ready Yet: Try again in ${config.timePollSeconds} Seconds`,
            headers: {
                'Cache-Control': `public, max-age=${config.timeExtendSeconds}`
            }
        };
        context.done();
        return;
    }

    // Return Old Lookup (Short)
    context.res = {
        body: lookup,
        headers: {
            'Cache-Control': `public, max-age=${config.timeExtendSeconds}`
        }
    };
    context.done();
};
