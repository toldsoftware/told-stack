import { HttpFunction_Config, HttpFunction_TemplateConfig, OutputBlobData, HttpFunction_BindingData } from "../src-config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../../core/types/functions";

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
                name: "outOutputBlob",
                type: "blob",
                direction: "out",
                path: config.outputBlob_path,
                connection: "AZURE_STORAGE_CONNECTION_STRING"
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
        outOutputBlob: OutputBlobData,
    }
}, req: HttpFunctionRequest) {
    const data = config.getDataFromRequest(req, context.bindingData);
    context.bindings.outOutputBlob = data;
    // context.log('The Data was Queued', data);
    context.res = {
        body: 'The Data was Stored'
    };
    context.done();
};
