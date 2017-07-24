import { LogItem } from "./types";
import { ClientConfig } from "./client-config";
import { leftPad } from "../../utils/left-pad";
import { randHex } from "../../utils/rand";
import { HttpFunctionRequest_ClientInfo, QueueBinding, TableBinding } from "../../types/functions";
import { createTrigger } from "../../azure-functions/function-builder";

export interface FunctionTemplateConfig {
    storageConnection: string;
    http_route: string;
    getBinding_logQueue: () => QueueBinding;
    getBinding_logTable: () => TableBinding;
}

export interface HttpFunction_BindingData {
    // Doesn't work
    // DateTime: string;
    // ['rand-guid']: string;
}

export interface LogQueue {
    items: LogItem[];

    sessionToken: string;
    userId_claimed: string;

    ip: string;
    userAgent: string;

    requestInfo?: HttpFunctionRequest_ClientInfo;
}

export const logQueueTrigger = createTrigger({
    sessionToken: '',
    userId_claimed: '',
});

export interface ServerConfigType {
    // getLogOversizeBlobName(bindingData: HttpFunction_BindingData): string;

    getPartitionKey(item: LogItem): string;
    getRowKey(item: LogItem): string;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    storageConnection = this.default_storageConnectionString_AppSettingName;

    http_route = this.clientConfig.sendLog_route;
    getBinding_logQueue = (): QueueBinding => ({
        connection: this.storageConnection,
        queueName: 'log',
    })

    getBinding_logTable = (): TableBinding => ({
        connection: this.storageConnection,
        tableName: 'log',
        partitionKey: undefined,
        rowKey: undefined,
    });

    constructor(
        private clientConfig: ClientConfig,
        private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING',
    ) {

    }

    getPartitionKey(item: LogItem) {
        return `${item.sessionInfo.sessionToken}`;
    }

    getRowKey(item: LogItem) {
        // Avoid Collisions in case of bot using replay values (add Random and Date)
        return `${item.sessionInfo.userId_claimed}_t-${leftPad(item.runTime, 10, '-')}_r-${randHex(8)}_d-${Date.now()}`;
    }
}