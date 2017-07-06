import { FunctionTemplateConfig, DataUpdateConfig, DataKey, UpdateRequestQueueMessage, ChangeBlob } from "../src-config/config";

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
                queueName: config.updateRequestQueue_queueName,
                connection: config.updateRequestQueue_connection
            },
            {
                name: "inoutChangeBlob",
                type: "blob",
                direction: "inout",
                path: config.changeBlob_path_fromQueueTrigger,
                connection: config.changeBlob_connection
            },
            {
                name: "outUpdateExecuteQueue",
                type: "queue",
                direction: "out",
                queueName: config.updateExecuteQueue_queueName,
                connection: config.updateExecuteQueue_connection
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
        inoutChangeBlob: ChangeBlob,
        outUpdateExecuteQueue: UpdateRequestQueueMessage,
    }
}) {
    if (context.bindings.inoutChangeBlob
        && context.bindings.inoutChangeBlob.startTime
        && context.bindingData.insertionTime.getTime() < context.bindings.inoutChangeBlob.startTime + config.timeExecutionSeconds * 1000) {
        // The update is already executing, don't do anything
        context.done();
        return;
    }

    // Queue Execute Update
    context.bindings.inoutChangeBlob = { startTime: Date.now() };
    context.bindings.outUpdateExecuteQueue = context.bindings.inUpdateRequestQueue;
    context.done();
}