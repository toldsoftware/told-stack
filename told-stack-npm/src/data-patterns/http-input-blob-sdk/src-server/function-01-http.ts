import { HttpFunction_Config, HttpFunction_TemplateConfig, InputBlobData, HttpFunction_BindingData } from "../src-config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../../core/types/functions";
import { readBlob } from "../../../core/utils/azure-storage/blobs";

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
            // {
            //     name: "inInputBlob",
            //     type: "blob",
            //     direction: "int",
            //     path: config.inputBlob_path,
            //     connection: config.inputBlob_connection
            // },
        ],
        disabled: false
    };
}

export async function runFunction(config: HttpFunction_Config, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_BindingData,
    bindings: {
        // inInputBlob: InputBlobData,
    }
}, req: HttpFunctionRequest) {
    // const data = context.bindings.inInputBlob;
    const data = await readBlob<InputBlobData>(context.bindingData.container, context.bindingData.blob);
    context.res = {
        body: data,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    context.done();
};
