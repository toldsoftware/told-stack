import * as path from 'path';
import * as fs from 'fs';
import { HttpFunctionRequest, HttpFunctionResponse, HttpFunctionRequest_ClientInfo } from "../../types/functions";
import { FunctionTemplateConfig, ServerConfigType, HttpFunction_BindingData } from "../config/server-config";

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                direction: "in",
                authLevel: "anonymous",
                route: config.http_route
            },
            {
                name: "res",
                type: "http",
                direction: "out",
                // dataType: "stream",
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_BindingData,
    bindings: {
    }
}, req: HttpFunctionRequest) {
    context.log('START', { query: req.query });

    let p = '';

    try {
        p = config.getPath(req);
    } catch (err) {
        context.res = {
            isRaw: true,
            body: {
                error: 'File Path Error',
                also: 'Ain\'t nobody got time for that',
                ref: 'https://youtu.be/Nh7UgAprdpM',
            },
            headers: {
                'Cache-Control': 'max-age=300, public',
                'Content-Type': 'application/json',
            }
        };

        context.log('ERROR', { err });
        context.done();
        return;
    }

    context.log('Reading File', { p, query: req.query });

    fs.readFile(p, (err, data) => {
        context.log('readFile', { p, err });

        if (err != null) {
            context.res = {
                status: 404,
                body: `File not found: ${p}`,
                headers: {
                    'Cache-Control': 'max-age=15, public',
                    'Content-Type': 'text/plain',
                }
            };

            context.log('readFile ERROR', { p, err });
            context.done();
            return;
        }

        let body = data;

        let type = 'text/plain';

        if (p.match('\.html$')) { type = 'text/html'; }
        if (p.match('\.css$')) { type = 'text/css'; }
        if (p.match('\.js$')) { type = 'application/x-javascript'; }
        if (p.match('\.json$')) { type = 'application/json'; }
        if (p.match('\.jpg$')) { type = 'image/jpeg'; }
        if (p.match('\.png$')) { type = 'image/png'; }
        if (p.match('\.gif$')) { type = 'image/gif'; }
        if (p.match('\.ico$')) { type = 'image/x-icon'; }

        context.res = {
            isRaw: true,
            body,
            headers: {
                'Cache-Control': 'max-age=300, public',
                'Content-Type': type,
            }
        };

        context.log('DONE', { bodyType: Object.getPrototypeOf(body).name, bodyLength: body.length });
        context.done();
    });
}