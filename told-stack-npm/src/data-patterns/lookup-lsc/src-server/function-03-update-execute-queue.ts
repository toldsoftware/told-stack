import { FunctionTemplateConfig, ServerConfigType, DataKey, UpdateRequestQueueMessage, ChangeData, LookupData } from "../src-config/server-config";
import { gzipText } from "../../../core/utils/gzip";
import { insertOrMergeTableEntity_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { writeBlobBuffer } from "../../../core/utils/azure-storage-sdk/blobs";

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
                name: "inRawDataBlob",
                type: "blob",
                direction: "in",
                path: config.dataRawBlob_path_fromQueueTrigger,
                connection: config.dataRawBlob_connection,
            },
            {
                name: "outRawDataBlob",
                type: "blob",
                direction: "out",
                path: config.dataRawBlob_path_fromQueueTrigger,
                connection: config.dataRawBlob_connection,
            },
            // {
            //     name: "outDataDownloadBlob",
            //     type: "blob",
            //     direction: "out",
            //     path: config.dataDownloadBlob_path_from_queueTriggerDate,
            //     connection: config.dataDownloadBlob_connection,
            // },
            {
                name: "inLookupTable",
                type: "table",
                direction: "in",
                tableName: config.lookupTable_tableName_fromQueueTrigger,
                partitionKey: config.lookupTable_partitionKey_fromQueueTrigger,
                rowKey: config.lookupTable_rowKey_fromQueueTrigger,
                connection: config.lookupTable_connection,
            },
            {
                name: "outLookupTable",
                type: "table",
                direction: "out",
                tableName: config.lookupTable_tableName_fromQueueTrigger,
                partitionKey: config.lookupTable_partitionKey_fromQueueTrigger,
                rowKey: config.lookupTable_rowKey_fromQueueTrigger,
                connection: config.lookupTable_connection,
            },

        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    bindingData: {},
    bindings: {
        inUpdateExecuteQueue: UpdateRequestQueueMessage,
        inRawDataBlob: any,
        outRawDataBlob: any,
        outDataDownloadBlob: any,
        inLookupTable: LookupData,
        outLookupTable: LookupData,
    }
}) {
    context.log('START');

    context.log('Obtain New Data');
    const blobData = await config.obtainBlobData(context.bindings.inRawDataBlob, context.bindings.inUpdateExecuteQueue);

    context.log('Save New Data to Raw Blob');
    context.bindings.outRawDataBlob = blobData;

    // TODO: Set the Download Blob CDN Data
    // 'Content-Type': 'application/json',
    // 'Cache-Control': `public, max-age=${config.timeCacheControlSeconds_downloadBlob||4*StaleTimeout?}`,
    context.log('Gzip and Save New Data to Download Blob');

    const downloadData = config.shouldGzip ? await gzipText(JSON.stringify(blobData)) : JSON.stringify(blobData);
    // context.bindings.outDataDownloadBlob = downloadData;
    const containerName = context.bindings.inUpdateExecuteQueue.containerName;
    const downloadBlobName = config.getDataDownloadBlobName_from_queueMessage(context.bindings.inUpdateExecuteQueue);
    await writeBlobBuffer(containerName, downloadBlobName, downloadData, {
        contentSettings: {
            cacheControl: `public, max-age=${config.timeToLiveSeconds_downloadBlob}`,
            contentEncoding: config.shouldGzip ? 'gzip' : undefined,
            contentType: 'application/json',
        }
    });

    context.log('Update Lookup Table');
    // context.bindings.outLookupTable = { startTime: context.bindings.inUpdateExecuteQueue.startTime };
    context.bindings.outLookupTable = await insertOrMergeTableEntity_sdk(config.getLookupTableRowKey_fromQueueTrigger(context.bindings.inUpdateExecuteQueue),
        context.bindings.inLookupTable, { timeKey: context.bindings.inUpdateExecuteQueue.timeKey } as LookupData);

    context.log('DONE');
    context.done();
}