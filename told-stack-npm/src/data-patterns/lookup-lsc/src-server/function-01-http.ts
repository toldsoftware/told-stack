import { DataUpdateConfig, DataKey, FunctionTemplateConfig, UpdateRequestQueueMessage, ChangeTable, LookupTable, HttpFunction_BindingData } from "../src-config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../../core/types/functions";
import { readBlob } from "../../../core/utils/azure-storage-sdk/blobs";

// Http Request: Handle Update Request
// Table In: Read Old Lookup Blob Value
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
                name: "inLookupTable",
                type: "table",
                direction: "in",
                tableName: config.lookupTable_tableName,
                partitionKey: config.lookupTable_partitionKey,
                rowKey: config.lookupTable_rowKey,
                connection: config.lookupBlob_connection
            },
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
        inLookupTable: LookupTable,
        outUpdateRequestQueue: UpdateRequestQueueMessage,
    }
}, req: HttpFunctionRequest) {
    context.log('START');

    const dataKey = config.getKeyFromRequest(req, context.bindingData);
    const lookup = context.bindings.inLookupTable;

    context.log('Lookup', { lookup });

    // If the blob value is not stale
    // Return Current Blob Value with Long TTL
    const remainingTtl = lookup && lookup.timeKey
        && Math.ceil((parseInt(lookup.timeKey) + config.timeToLiveSeconds * 1000 - Date.now()) / 1000);

    context.log('remainingTtl', { remainingTtl, timeKey: lookup, timeToLiveSeconds: config.timeToLiveSeconds, now: Date.now() });

    if (remainingTtl > config.timeExtendSeconds) {

        context.log('Return Old Lookup', { lookup, remainingTtl });

        // Return Old Lookup (Long TTL)
        context.res = {
            body: lookup,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': `public, max-age=${remainingTtl}`
            }
        };

        context.log('DONE');
        context.done();
        return;
    }

    context.log('Request Update');

    // Set Update Request Queue
    context.bindings.outUpdateRequestQueue = { ...dataKey, timeKey: '' + Date.now() };

    // Return Current Blob Value with Short TTL

    if (!lookup) {

        context.log('Missing Lookup (First Time?)');

        context.res = {
            body: { error: `Not Ready Yet: Try again in ${config.timePollSeconds} Seconds` },
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': `public, max-age=${config.timeExtendSeconds}`,
            }
        };

        // context.res = {
        //     status: 400,
        //     body: `Not Ready Yet: Try again in ${config.timePollSeconds} Seconds`,
        //     headers: {
        //         'Cache-Control': `public, max-age=${config.timeExtendSeconds}`
        //     }
        // };

        context.log('DONE');
        context.done();
        return;
    }

    // Return Old Lookup (Short)
    context.log('Return Old Lookup with Short TTL while Getting New Lookup and Value');

    context.res = {
        body: lookup,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${config.timeExtendSeconds}`,
        }
    };

    context.log('DONE');
    context.done();
};
