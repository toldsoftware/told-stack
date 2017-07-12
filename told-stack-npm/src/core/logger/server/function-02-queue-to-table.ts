import { FunctionTemplateConfig, ServerConfigType, LogQueueMessage } from "../config/server-config";
import { insertOrMergeTableRow_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { LogItem } from "../config/types";

// Queue Trigger: Update Request Queue
// Table In-Out: Changing Blob Singleton Check
// Queue Out: Update Execute Queue Only Once Per Stale Timeout

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "inLogQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.logQueue_queueName,
                connection: config.storageConnection
            },
            {
                name: "outLogTable",
                type: "table",
                direction: "out",
                tableName: config.logTable_tableName_fromQueueTrigger,
                // partitionKey: config.logTable_partitionKey_fromQueueTrigger,
                // rowKey: config.logTable_rowKey_fromQueueTrigger,
                connection: config.storageConnection
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
        inLogQueue: LogQueueMessage,
        outLogTable: LogItem & { PartitionKey: string, RowKey: string }[],
    }
}) {
    context.log('START', { insertionTime: context.bindingData.insertionTime, itemsLength: context.bindings.inLogQueue.items.length });

    context.bindings.outLogTable.push(...context.bindings.inLogQueue.items.map(x => ({
        PartitionKey: `${x.startTime}_${x.userInfo.sessionId}`,
        RowKey: x.userInfo.userId,
        ...x,
    })));

    context.log('DONE');
    context.done();
}