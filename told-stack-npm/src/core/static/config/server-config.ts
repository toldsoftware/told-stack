import * as path from 'path';
import * as fs from 'fs';
import { HttpFunctionRequest } from "../../types/functions";


export interface FunctionTemplateConfig {
    storageConnection: string;
    http_route: string;
}

export interface HttpFunction_BindingData {
}

export interface ServerConfigType {
    getPath(req: HttpFunctionRequest): string;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    storageConnection = this.default_storageConnectionString_AppSettingName;
    http_route = this.apiRoute;

    constructor(
        private pathToStatic = '../static',
        private apiRoute = 'api/static',
        private default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING',
    ) {

    }

    getPath(req: HttpFunctionRequest) {
        const filename = req.query.file
            || 'index.html';

        const dir = path.join(__dirname, '../static');
        let p = path.join(dir, filename);

        if (fs.statSync(p).isDirectory()) {
            p = path.join(p, 'index.html');
        }

        return p;
    }
}