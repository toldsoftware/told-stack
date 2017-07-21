import { HttpFunctionRequest_ClientInfo } from "../../types/functions";

export interface FunctionTemplateConfig {
    // storageConnection: string;
    http_route: string;
}

export interface HttpFunction_BindingData {
}

export interface ServerConfigType {
    runTests: (log: typeof console.log) => Promise<any>;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {
    // storageConnection = this.default_storageConnectionString_AppSettingName;

    constructor(
        public http_route: string,
        public runTests: (log: typeof console.log) => Promise<any>
        // private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING',
    ) { }

}