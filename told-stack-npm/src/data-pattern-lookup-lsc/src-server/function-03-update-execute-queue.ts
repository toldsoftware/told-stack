import { FunctionTemplateConfig, DataUpdateConfig, DataKey, UpdateRequestQueueMessage } from "../src-config/config";

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
                name: "outChangingBlob",
                type: "blob",
                direction: "out",
                path: config.changingBlob_path_fromQueueTrigger
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: DataUpdateConfig, context: {
    log: typeof console.log,
    done: () => void,
    bindingData: {
    },
    bindings: {
        inUpdateExecuteQueue: UpdateRequestQueueMessage,
        inoutRawDataBlob: any,
        outChangingBlob: { startTime: number },
    }
}) {
    context.bindings.inoutRawDataBlob = await config.obtainBlobData(context.bindings.inoutRawDataBlob, context.bindings.inUpdateExecuteQueue);
    context.bindings.outChangingBlob = null;
    context.done();
}