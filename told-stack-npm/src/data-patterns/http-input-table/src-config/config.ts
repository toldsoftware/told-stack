import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
    inputTable_tableName: string;
    inputTable_partitionKey: string;
    inputTable_rowKey: string;
    inputTable_connection: string;
}

export interface HttpFunction_Config {
    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): InputTableData;
}

export interface HttpFunction_BindingData {
    container: string;
    blob: string;
}

export interface InputTableData {
    key: HttpFunction_BindingData;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    constructor(
        public http_routeRoot = 'api/http-input-table',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING') { }

    http_route = this.http_routeRoot + '/{table}/{partition}/{row}';
    inputTable_tableName = '{table}';
    inputTable_partitionKey = '{partition}';
    inputTable_rowKey = '{row}';
    inputTable_connection = this.default_storageConnectionString_AppSettingName;

    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
        return { key: { container: bindingData.container, blob: bindingData.blob }, value: req.body };
    }
}