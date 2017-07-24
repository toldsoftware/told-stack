import { build_createFunctionJson, buildFunction_common, build_binding, build_runFunction_common } from "../../azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, LogQueue, logQueueTrigger } from "../config/server-config";
import { insertOrMergeTableEntity_sdk } from "../../../core/utils/azure-storage-binding/tables-sdk";
import { LogItem } from "../config/types";
import { randHex } from "../../utils/rand";
import { leftPad } from "../../utils/left-pad";

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_common(logQueueTrigger)
        .bindings(t => ({
            inLogQueueTrigger: build_binding<LogQueue>(config.getBinding_logQueue()),
            outLogTable: build_binding<LogItem[]>(config.getBinding_logTable()),
        }));
}
export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_common(buildFunction, (config: ServerConfigType, context) => {
    context.log('START', { itemsLength: context.bindings.inLogQueueTrigger.items.length });

    const ip = context.bindings.inLogQueueTrigger.ip;
    const userAgent = context.bindings.inLogQueueTrigger.userAgent;
    const requestInfo = context.bindings.inLogQueueTrigger.requestInfo;

    context.bindings.outLogTable = context.bindings.inLogQueueTrigger.items.map((x, i) => ({
        PartitionKey: config.getPartitionKey(x),
        RowKey: config.getRowKey(x),
        ip: i === 0 ? ip : undefined,
        ...x,
        // userAgent: i === 0 ? userAgent : undefined,
        requestInfo: i === 0 ? requestInfo : undefined,
    }));

    context.log('DONE');
    context.done();
});
