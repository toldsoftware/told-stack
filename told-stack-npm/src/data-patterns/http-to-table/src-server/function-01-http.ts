import { HttpFunction_Config, HttpFunction_TemplateConfig, OutputTableData, HttpFunction_BindingData } from "../src-config/config";
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
                name: "outOutputTable",
                type: "table",
                direction: "out",
                tableName: config.outputTable_tableName,
                partitionKey: config.outputTable_partitionKey,
                rowKey: config.outputTable_rowKey,
                connection: config.outputTable_connection
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
        outOutputTable: OutputTableData,
    }
}, req: HttpFunctionRequest) {
    const data = config.getDataFromRequest(req, context.bindingData);
    context.bindings.outOutputTable = data;
    // context.log('The Data was Queued', data);
    context.res = {
        body: 'The Data was Stored in a Table'
    };
    context.done();
};
