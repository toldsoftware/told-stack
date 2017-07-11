import { LogItem } from "./types";

export interface FunctionTemplateConfig {
    storageConnection: string;

    http_route: string;

    logQueue_queueName: string;
    logOversizeQueue_queueName: string;
    logOversizeBlob_path: string;
}

export interface HttpFunction_BindingData {
    // Nothing here
    DateTime: string;
    ['rand-guid']: string;
}

export interface LogQueueMessage {
    items: LogItem[];
}

export interface ServerConfigType {
    getLogOversizeBlobName(bindingData: HttpFunction_BindingData): string;
}

export class ServerConfig implements ServerConfigType {

    storageConnection = this.default_storageConnectionString_AppSettingName;
    logQueue_queueName = 'log';
    logOversizeQueue_queueName = 'log-oversize';
    logOversizeBlob_path = `log-oversize/{DateTime}_{rand-guid}.json`;

    getLogOversizeBlobName(bindingData: HttpFunction_BindingData) {
        return this.logOversizeBlob_path
            .replace('{DateTime}', bindingData.DateTime)
            .replace('{rand-guid}', bindingData['rand-guid'])
            ;
    }

    constructor(private default_storageConnectionString_AppSettingName: string) {

    }

}