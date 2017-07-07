import { HttpFunction_Config, HttpFunction_TemplateConfig, OutputQueueData, HttpFunction_BindingData } from "../src-config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../../../core/types/functions";

// Http Request: Handle Update Request
// Blob In: Read Old Lookup Blob Value
// Queue Out: Update Request Queue
// Http Response: Return Old Lookup Value with Short TTL

export function createFunctionJson(config: HttpFunction_TemplateConfig) {
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
                name: "outOutputQueue",
                type: "queue",
                direction: "out",
                queueName: config.outputQueue_queueName,
                connection: config.outputQueue_connection
            },
        ],
        disabled: false
    };
}

export function runFunction(config: HttpFunction_Config, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_BindingData,
    bindings: {
        outOutputQueue: OutputQueueData,
    }
}, req: HttpFunctionRequest) {
    context.log('START Immediate Response');
    context.res = {
        body: 'The Data will be Queued',
        headers: {
            'Content-Type': 'text/plain'
        }
    };
    
    // EXPERIMENT: Will the response be sent before the done call?
    // Wait 5 Seconds before marking done
    // Test how quickly the response is received.

    // RESULT: The response is not processed until context.done() is called

    context.log('Wait 5 Seconds');

    setTimeout(() => {
        context.log('Queue Message');

        const data = config.getDataFromRequest(req, context.bindingData);
        context.bindings.outOutputQueue = data;

        context.log('DONE');
        context.done();
    }, 5000);
};
