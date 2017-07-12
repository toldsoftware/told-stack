import { LogItem } from "./types";
import { ClientConfig } from "./client-config";
import { leftPad } from "../../utils/left-pad";
import { randHex } from "../../utils/rand";
import { HttpFunctionRequest_ClientInfo } from "../../types/functions";

export interface FunctionTemplateConfig {
    storageConnection: string;

    http_route: string;

    logQueue_queueName: string;
    // logOversizeQueue_queueName: string;
    // logOversizeBlob_path: string;

    logTable_tableName_fromQueueTrigger: string;
    // logTable_partitionKey_fromQueueTrigger: string;
    // logTable_rowKey_fromQueueTrigger: string;
}

export interface HttpFunction_BindingData {
    // Nothing here
    DateTime: string;
    ['rand-guid']: string;
}

export interface LogQueueMessage {
    items: LogItem[];
    ip: string;
    userAgent: string;
    requestInfo?: HttpFunctionRequest_ClientInfo;
}

export interface ServerConfigType {
    // getLogOversizeBlobName(bindingData: HttpFunction_BindingData): string;

    getPartitionKey(item: LogItem): string;
    getRowKey(item: LogItem): string;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    storageConnection = this.default_storageConnectionString_AppSettingName;

    http_route = this.clientConfig.sendLog_route;

    logQueue_queueName = 'log';
    // logOversizeQueue_queueName = 'log-oversize';
    // logOversizeBlob_path = `log-oversize/{DateTime}_{rand-guid}.json`;

    // getLogOversizeBlobName(bindingData: HttpFunction_BindingData) {
    //     return this.logOversizeBlob_path
    //         .replace('{DateTime}', bindingData.DateTime)
    //         .replace('{rand-guid}', bindingData['rand-guid'])
    //         ;
    // }

    logTable_tableName_fromQueueTrigger = `log`;
    // logTable_partitionKey_fromQueueTrigger = `{}`;
    // logTable_rowKey_fromQueueTrigger = ``;

    constructor(
        private clientConfig: ClientConfig,
        private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING',
    ) {

    }

    getPartitionKey(item: LogItem) {
        return `${item.userInfo.sessionId}`;
    }

    getRowKey(item: LogItem) {
        return `${item.userInfo.userId}_t-${leftPad(item.runTime, 10, '-')}_r-${randHex(4)}`;
    }
}