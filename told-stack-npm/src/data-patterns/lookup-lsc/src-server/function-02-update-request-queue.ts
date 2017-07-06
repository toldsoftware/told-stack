import { FunctionTemplateConfig, DataUpdateConfig, DataKey, UpdateRequestQueueMessage, ChangeTable } from "../src-config/config";

// Queue Trigger: Update Request Queue
// Table In-Out: Changing Blob Singleton Check
// Queue Out: Update Execute Queue Only Once Per Stale Timeout

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inUpdateRequestQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.updateRequestQueue_queueName,
                connection: config.updateRequestQueue_connection
            },
            {
                name: "inoutChangeTable",
                type: "blob",
                direction: "inout",
                tableName: config.changeTable_tableName_fromQueueTrigger,
                partitionKey: config.changeTable_partitionKey_fromQueueTrigger,
                rowKey: config.changeTable_rowKey_fromQueueTrigger,
                connection: config.changeTable_connection
            },
            {
                name: "outUpdateExecuteQueue",
                type: "queue",
                direction: "out",
                queueName: config.updateExecuteQueue_queueName,
                connection: config.updateExecuteQueue_connection
            },

            // BUG FIX: To Prevent inout RawDataBlob from crashing next step if it doesn't exist
            {
                name: "outRawDataBlob",
                type: "blob",
                direction: "out",
                path: config.dataRawBlob_path_fromQueueTrigger,
                connection: config.dataRawBlob_connection,
            },
        ],
        disabled: false
    };
}

export function runFunction(config: DataUpdateConfig, context: {
    log: typeof console.log,
    done: () => void,
    bindingData: {
        insertionTime: Date,
    },
    bindings: {
        inUpdateRequestQueue: UpdateRequestQueueMessage,
        inoutChangeTable: ChangeTable,
        outUpdateExecuteQueue: UpdateRequestQueueMessage,
        outRawDataBlob: any,
    }
}) {
    // BUG FIX: To Prevent inout RawDataBlob from crashing next step if it doesn't exist
    if (!context.bindings.inoutChangeTable) {
        context.bindings.outRawDataBlob = {};
    }

    if (context.bindings.inoutChangeTable
        && context.bindings.inoutChangeTable.startTime
        && context.bindingData.insertionTime.getTime() < context.bindings.inoutChangeTable.startTime + config.timeExecutionSeconds * 1000) {
        // The update is already executing, don't do anything
        context.done();
        return;
    }

    // Queue Execute Update
    context.bindings.inoutChangeTable = { startTime: Date.now() };
    context.bindings.outUpdateExecuteQueue = context.bindings.inUpdateRequestQueue;
    context.done();
}