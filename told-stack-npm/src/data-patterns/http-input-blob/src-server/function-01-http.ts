import { HttpFunction_Config, HttpFunction_TemplateConfig, InputBlobData, HttpFunction_BindingData } from "../src-config/config";
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
                name: "inInputBlob",
                type: "blob",
                direction: "in",
                path: config.inputBlob_path,
                connection: config.inputBlob_connection
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
        inInputBlob: InputBlobData,
    }
}, req: HttpFunctionRequest) {
    const data = context.bindings.inInputBlob;
    context.res = {
        body: data,
        headers: {
            'Content-Type': config.responseOptions.contentType || 'application/json',
            'Content-Encoding': config.responseOptions.contentEncoding || undefined,
            'Cache-Control': config.responseOptions.cacheControl || undefined,
        }
    };
    context.done();
};
