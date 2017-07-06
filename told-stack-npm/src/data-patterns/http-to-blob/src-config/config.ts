import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
    outputBlob_path: string;
    outputBlob_connection: string;
}

export interface HttpFunction_Config {
    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): OutputBlobData;
}

export interface HttpFunction_BindingData {
    container: string;
    blob: string;
}

export interface OutputBlobData {
    key: HttpFunction_BindingData;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    constructor(
        public http_routeRoot = 'api/http-to-queue',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING') { }

    http_route = this.http_routeRoot + '/{container}/{blob}';
    outputBlob_path = '{container}/{blob}';
    outputBlob_connection = this.default_storageConnectionString_AppSettingName;

    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
        return { key: { container: bindingData.container, blob: bindingData.blob }, value: req.body };
    }
}