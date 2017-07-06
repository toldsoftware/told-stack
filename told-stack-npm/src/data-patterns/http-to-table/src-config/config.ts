import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;

    outputTable_tableName: string;
    outputTable_partitionKey: string;
    outputTable_rowKey: string;
    outputTable_connection: string;
}

export interface HttpFunction_Config {
    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): OutputQueueData;
}

export interface HttpFunction_BindingData {
    key: string;
}

export interface OutputQueueData {
    key: string;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    constructor(
        public http_routeRoot = 'api/http-to-table',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING') { }

    http_route = this.http_routeRoot + '/{table}/{partition}/{row}';

    outputTable_tableName = `{table}`;
    outputTable_partitionKey = `{partition}`;
    outputTable_rowKey = `{row}`;
    outputTable_connection = this.default_storageConnectionString_AppSettingName;

    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
        return { key: bindingData.key, value: req.body };
    }
}