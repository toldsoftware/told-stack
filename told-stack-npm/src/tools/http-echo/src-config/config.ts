import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
}

export interface HttpFunction_Config {
    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): InputData;
}

export interface HttpFunction_BindingData {
    path: string;
}

export interface InputData {
    key: HttpFunction_BindingData;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    constructor(
        public http_routeRoot = 'api/http-echo',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING') { }

    http_route = this.http_routeRoot + '/{*path}';

    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
        return { key: { path: bindingData.path }, value: req.body };
    }
}