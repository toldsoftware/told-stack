import { FunctionTemplateConfig, DataUpdateConfig, DataKey, UpdateRequestQueueMessage } from "../src-config/config";

// Queue Trigger: Update Request Queue
// Blob In-Out: Changing Blob Singleton Check
// Queue Out: Update Execute Queue Only Once Per Stale Timeout

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inUpdateRequestQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.updateRequestQueue_queueName
            },
            {
                name: "inoutChangingBlob",
                type: "blob",
                direction: "inout",
                path: config.changingBlob_path_fromQueueTrigger
            },
            {
                name: "outUpdateExecuteQueue",
                type: "queue",
                direction: "out",
                queueName: config.updateExecuteQueue_queueName
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
        inoutChangingBlob: { startTime: number },
        outUpdateExecuteQueue: UpdateRequestQueueMessage,
    }
}) {
    if (context.bindings.inoutChangingBlob
        && context.bindings.inoutChangingBlob.startTime
        && context.bindingData.insertionTime.getTime() < context.bindings.inoutChangingBlob.startTime + config.timeExecutionSeconds) {
        // The update is already executing, don't do anything
        context.done();
        return;
    }

    // Queue Execute Update
    context.bindings.inoutChangingBlob = { startTime: Date.now() };
    context.bindings.outUpdateExecuteQueue = context.bindings.inUpdateRequestQueue;
    context.done();
}