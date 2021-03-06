import { FunctionTemplateConfig, ServerConfigType, DataKey, UpdateRequestQueueMessage, ChangeData } from "../src-config/server-config";
import { insertOrMergeTableEntity_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";

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
                name: "inChangeTable",
                type: "table",
                direction: "in",
                tableName: config.changeTable_tableName_fromQueueTrigger,
                partitionKey: config.changeTable_partitionKey_fromQueueTrigger,
                rowKey: config.changeTable_rowKey_fromQueueTrigger,
                connection: config.changeTable_connection
            },
            {
                name: "outChangeTable",
                type: "table",
                direction: "out",
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
            {
                name: "outDataDownloadBlob",
                type: "blob",
                direction: "out",
                path: config.dataDownloadBlob_path_from_queueTrigger,
                connection: config.dataDownloadBlob_connection,
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    bindingData: {
        insertionTime: Date,
    },
    bindings: {
        inUpdateRequestQueue: UpdateRequestQueueMessage,
        inChangeTable: ChangeData,
        outChangeTable: ChangeData,
        outUpdateExecuteQueue: UpdateRequestQueueMessage,
        outRawDataBlob: any,
        outDataDownloadBlob: any,
    }
}) {
    context.log('START', { inChangeTable: context.bindings.inChangeTable, insertionTime: context.bindingData.insertionTime });

    // BUG FIX: To Prevent inout RawDataBlob from crashing next step if it doesn't exist
    if (!context.bindings.inChangeTable) {
        context.bindings.outRawDataBlob = { __empty: '' };
        context.bindings.outDataDownloadBlob = { __empty: '' };
        context.log('Ensure RawDataBlob exists');
    }

    const changeTime = context.bindings.inChangeTable
        && context.bindings.inChangeTable.changeTime;

    const remainingTimeToFinish = changeTime
        && (changeTime + config.timeExecutionSeconds * 1000 - Date.now());

    context.log('remainingTimeToFinish', { remainingTimeToFinish });

    if (remainingTimeToFinish > 0) {
        // The update is already executing, don't do anything
        context.log('DONE Already Executing Update');
        context.done();
        return;
    }

    // Queue Execute Update
    context.log('Execute Update');

    // context.bindings.outChangeTable = { startTime: Date.now() };
    context.bindings.outChangeTable = await insertOrMergeTableEntity_sdk(config.getChangeTableRowKey_fromQueueTrigger(context.bindings.inUpdateRequestQueue),
        context.bindings.inChangeTable,
        { changeTime: Date.now() } as ChangeData);

    context.bindings.outUpdateExecuteQueue = context.bindings.inUpdateRequestQueue;

    context.log('DONE');
    context.done();
}