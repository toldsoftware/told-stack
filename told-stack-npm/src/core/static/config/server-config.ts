import * as path from 'path';
import * as fs from 'fs';
import { HttpFunctionRequest } from "../../types/functions";


export interface FunctionTemplateConfig {
    http_route: string;
}

export interface HttpFunction_BindingData {
}

export interface ServerConfigType {
    getPath(req: HttpFunctionRequest): string;
    injectSettingsPrefix: string;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    http_route = this.apiRoute;

    constructor(
        public injectSettingsPrefix = 'INJECT_',
        private pathToStatic = '../static',
        private apiRoute = 'api/static',
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