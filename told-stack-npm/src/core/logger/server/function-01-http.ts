import { HttpFunctionRequest, HttpFunctionResponse } from "../../types/functions";
import { FunctionTemplateConfig, ServerConfigType, HttpFunction_BindingData, LogQueueMessage } from "../config/server-config";
import { LogItem } from "../config/types";

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
                name: "outLogQueue",
                type: "queue",
                direction: "out",
                queueName: config.logQueue_queueName,
                connection: config.storageConnection
            },
            // {
            //     name: "outLogOversizeQueue",
            //     type: "queue",
            //     direction: "out",
            //     queueName: config.logOversizeQueue_queueName,
            //     connection: config.storageConnection
            // },
            // {
            //     name: "outLogOversizeBlob",
            //     type: "blob",
            //     direction: "out",
            //     path: config.logOversizeBlob_path,
            //     connection: config.storageConnection
            // },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_BindingData,
    bindings: {
        outLogQueue: LogQueueMessage,
        outLogOversizeQueue: string,
        outLogOversizeBlob: LogQueueMessage,
    }
}, req: HttpFunctionRequest) {
    context.log('START');

    // Handle Max Queue Size (64kb) -> Put in a blob
    const items = JSON.parse(req.body) as LogItem[];

    if (!items) {
        context.res = {
            body: {
                error: 'No Items Sent'
            },
            headers: {
                'Content-Type': 'application/json',
            }
        };

        context.log('DONE');
        context.done();
        return;
    }

    context.log(`Received ${items.length} log items`);

    // if (JSON.stringify(items).length < this.config.maxQueueSize) {
    context.bindings.outLogQueue = { items };
    context.log(`Stored in Queue`);
    // } else {
    //     context.bindings.outLogOversizeBlob = { items };
    //     context.bindings.outLogOversizeQueue = config.getLogOversizeBlobName(context.bindingData);
    //     context.log(`Stored in Oversize Blob`);
    // }

    context.res = {
        body: {
            ok: true
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
};
