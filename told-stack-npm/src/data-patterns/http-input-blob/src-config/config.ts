import { HttpFunctionRequest, HttpResponseOptions } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
    inputBlob_path: string;
    inputBlob_connection: string;
}

export interface HttpFunction_Config {
    // getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): InputBlobData;
    responseOptions: HttpResponseOptions;
}

export interface HttpFunction_BindingData {
    container: string;
    blob: string;
}

export interface InputBlobData {
    key: HttpFunction_BindingData;
    value: any;
}

export interface ConfigOptions {
    http_routeRoot?: string;
    default_storageConnectionString_AppSettingName?: string;
    responseOptions?: HttpResponseOptions;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    http_routeRoot = 'api/http-input-blob';
    default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING';
    responseOptions: HttpResponseOptions = {};

    constructor(options: ConfigOptions = {}) {
        Object.assign(this, options);
    }

    http_route = this.http_routeRoot + '/{container}/{*blob}';
    inputBlob_path = '{container}/{blob}';
    inputBlob_connection = this.default_storageConnectionString_AppSettingName;

    // getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
    //     return { key: { container: bindingData.container, blob: bindingData.blob }, value: req.body };
    // }
}