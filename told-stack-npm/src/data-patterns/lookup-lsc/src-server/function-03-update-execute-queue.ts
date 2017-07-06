import { FunctionTemplateConfig, DataUpdateConfig, DataKey, UpdateRequestQueueMessage, ChangeTable, LookupTable, DataUpdateBlobConfig } from "../src-config/config";
import { gzipText } from "../../../core/utils/gzip";

// Queue Trigger: Update Request Queue
// Blob In-Out: Raw Data Blob
// Blob Out: Download Data Blob
// Table Out: Lookup Blob

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inUpdateExecuteQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.updateExecuteQueue_queueName,
                connection: config.updateExecuteQueue_connection,
            },
            {
                name: "inoutRawDataBlob",
                type: "blob",
                direction: "inout",
                path: config.dataRawBlob_path_fromQueueTrigger,
                connection: config.dataRawBlob_connection,
            },
            {
                name: "outDataDownloadBlob",
                type: "blob",
                direction: "out",
                path: config.dataDownloadBlob_path_fromQueueTriggerDate,
                connection: config.dataDownloadBlob_connection,
            },
            {
                name: "outLookupTable",
                type: "blob",
                direction: "out",
                tableName: config.lookupTable_tableName,
                partitionKey: config.lookupTable_partitionKey,
                rowKey: config.lookupTable_rowKey,
                connection: config.lookupBlob_connection,
            },

        ],
        disabled: false
    };
}

export async function runFunction(config: DataUpdateBlobConfig<any>, context: {
    log: typeof console.log,
    done: () => void,
    bindingData: {},
    bindings: {
        inUpdateExecuteQueue: UpdateRequestQueueMessage,
        inoutRawDataBlob: any,
        outDataDownloadBlob: any,
        outLookupTable: LookupTable,
    }
}) {
    const blobData = await config.obtainBlobData(context.bindings.inoutRawDataBlob, context.bindings.inUpdateExecuteQueue);
    context.bindings.inoutRawDataBlob = blobData;
    context.bindings.outDataDownloadBlob = await gzipText(JSON.stringify(blobData));
    context.bindings.outLookupTable = { startTime: context.bindings.inUpdateExecuteQueue.startTime };
    context.done();
}