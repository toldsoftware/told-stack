import { FunctionTemplateConfig, ServerConfigType, LogQueueMessage } from "../config/server-config";
import { insertOrMergeTableRow_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { LogItem } from "../config/types";
import { randHex } from "../../utils/rand";
import { leftPad } from "../../utils/left-pad";

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
            {
                name: "inSessionLookupTable",
                type: "table",
                direction: "in",
                tableName: config.sessionLookupTable_tableName_fromQueueTrigger,
                partitionKey: config.sessionLookupTable_partitionKey_fromQueueTrigger,
                rowKey: config.sessionLookupTable_rowKey_fromQueueTrigger,
                connection: config.storageConnection
            },
            {
                name: "outSessionLookupTable",
                type: "table",
                direction: "out",
                tableName: config.sessionLookupTable_tableName_fromQueueTrigger,
                partitionKey: config.sessionLookupTable_partitionKey_fromQueueTrigger,
                rowKey: config.sessionLookupTable_rowKey_fromQueueTrigger,
                connection: config.storageConnection
            },
            {
                name: "inUserLookupTable",
                type: "table",
                direction: "in",
                tableName: config.userLookupTable_tableName_fromQueueTrigger,
                partitionKey: config.userLookupTable_partitionKey_fromQueueTrigger,
                rowKey: config.userLookupTable_rowKey_fromQueueTrigger,
                connection: config.storageConnection
            },
            {
                name: "outUserLookupTable",
                type: "table",
                direction: "out",
                tableName: config.userLookupTable_tableName_fromQueueTrigger,
                partitionKey: config.userLookupTable_partitionKey_fromQueueTrigger,
                rowKey: config.userLookupTable_rowKey_fromQueueTrigger,
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
        outLogTable: (LogItem & { PartitionKey: string, RowKey: string })[],
        inSessionLookupTable: { userId: string },
        outSessionLookupTable: { userId: string },
        inUserLookupTable: { sessionId: string },
        outUserLookupTable: { sessionId: string },
    }
}) {
    context.log('START', { insertionTime: context.bindingData.insertionTime, itemsLength: context.bindings.inLogQueue.items.length });

    const ip = context.bindings.inLogQueue.ip;
    const userAgent = context.bindings.inLogQueue.userAgent;
    const requestInfo = context.bindings.inLogQueue.requestInfo;
    context.bindings.outLogTable = context.bindings.inLogQueue.items.map((x, i) => ({
        PartitionKey: config.getPartitionKey(x),
        RowKey: config.getRowKey(x),
        ip: i === 0 ? ip : undefined,
        ...x,
        // userAgent: i === 0 ? userAgent : undefined,
        requestInfo: i === 0 ? requestInfo : undefined,
    }));

    // Add to Session and User Lookup Tables
    if (!context.bindings.inSessionLookupTable) {
        context.bindings.outSessionLookupTable = { userId: context.bindings.inLogQueue.userId };
    }
    if (!context.bindings.inUserLookupTable) {
        context.bindings.outUserLookupTable = { sessionId: context.bindings.inLogQueue.sessionId };
    }

    context.log('DONE');
    context.done();
}