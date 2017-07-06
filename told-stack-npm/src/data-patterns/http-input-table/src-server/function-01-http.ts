import { HttpFunction_Config, HttpFunction_TemplateConfig, InputTableData, HttpFunction_BindingData } from "../src-config/config";
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
                name: "inInputTable",
                type: "table",
                direction: "in",
                tableName: config.inputTable_tableName,
                partitionKey: config.inputTable_partitionKey,
                rowKey: config.inputTable_rowKey,
                connection: config.inputTable_connection
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
        inInputTable: InputTableData,
    }
}, req: HttpFunctionRequest) {
    const data = context.bindings.inInputTable;
    context.res = {
        body: data,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    context.done();
};
