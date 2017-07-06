import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
    outputBlob_path: string;
}

export interface HttpFunction_Config {
    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): OutputBlobData;
}

export interface HttpFunction_BindingData {
    key: string;
}

export interface OutputBlobData {
    key: string;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    constructor(
        public http_routeRoot = 'api/http-to-queue',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING') { }

    http_route = this.http_routeRoot + '/{key}';
    outputBlob_path = 'http-to-queue-output-queue';
    outputBlob_connection = this.default_storageConnectionString_AppSettingName;

    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
        return { key: bindingData.key, value: req.body };
    }
}