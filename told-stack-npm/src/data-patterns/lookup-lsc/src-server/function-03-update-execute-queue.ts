import { FunctionTemplateConfig, DataUpdateConfig, DataKey, UpdateRequestQueueMessage, ChangeBlob, LookupBlob, DataUpdateBlobConfig } from "../src-config/config";
import { gzipText } from "../../../core/utils/gzip";

// Queue Trigger: Update Request Queue
// Blob Out: Changing Blob
// Blob In-Out: Data Blob
// Blob Out: Lookup Blob

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inUpdateExecuteQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.updateExecuteQueue_queueName
            },
            {
                name: "inoutRawDataBlob",
                type: "blob",
                direction: "inout",
                path: config.dataRawBlob_path_fromQueueTrigger
            },
            {
                name: "outDataDownloadBlob",
                type: "blob",
                direction: "out",
                path: config.dataDownloadBlob_path_fromQueueTriggerDate
            },
            // {
            //     name: "outChangeBlob",
            //     type: "blob",
            //     direction: "out",
            //     path: config.changeBlob_path_fromQueueTrigger
            // },
            {
                name: "outLookupBlob",
                type: "blob",
                direction: "out",
                path: config.lookupBlob_path
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
        // outChangeBlob: ChangeBlob,
        outLookupBlob: LookupBlob,
    }
}) {
    const blobData = await config.obtainBlobData(context.bindings.inoutRawDataBlob, context.bindings.inUpdateExecuteQueue);
    context.bindings.inoutRawDataBlob = blobData;
    context.bindings.outDataDownloadBlob = await gzipText(JSON.stringify(blobData));

    // context.bindings.outChangeBlob = null;
    context.bindings.outLookupBlob = { startTime: context.bindings.inUpdateExecuteQueue.startTime };
    context.done();
}