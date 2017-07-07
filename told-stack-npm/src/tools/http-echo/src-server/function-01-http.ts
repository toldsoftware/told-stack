import { HttpFunction_Config, HttpFunction_TemplateConfig, InputData, HttpFunction_BindingData } from "../src-config/config";
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
    }
}, req: HttpFunctionRequest) {
    console.log('START');

    const data = config.getDataFromRequest(req, context.bindingData);
    context.res = {
        body: data,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log('DONE');
    context.done();
};
