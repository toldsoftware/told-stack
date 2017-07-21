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


        let type = 'text/plain';
        let shouldInject = false;

        if (p.match('\.html$')) { type = 'text/html'; shouldInject = true; }
        if (p.match('\.css$')) { type = 'text/css'; shouldInject = true; }
        if (p.match('\.js$')) { type = 'application/x-javascript'; shouldInject = true; }
        if (p.match('\.json$')) { type = 'application/json'; shouldInject = true; }
        if (p.match('\.jpg$')) { type = 'image/jpeg'; }
        if (p.match('\.png$')) { type = 'image/png'; }
        if (p.match('\.gif$')) { type = 'image/gif'; }
        if (p.match('\.ico$')) { type = 'image/x-icon'; }

        let body: string | Buffer = data;

        if (shouldInject) {
            const injectVars = Object.getOwnPropertyNames(process.env)
                .filter(k => k.indexOf(config.injectSettingsPrefix) === 0)
                .map(k => ({
                    find: k.replace(config.injectSettingsPrefix, ''),
                    replace: process.env[k],
                }));

            context.log('injectVars', { injectVars });

            if (injectVars.length) {
                let dataStr = data.toString('utf8');

                Object.getOwnPropertyNames(process.env).forEach(x => {
                    if (x.indexOf(config.injectSettingsPrefix) !== 0) { return; }
                    const find = x.replace(config.injectSettingsPrefix, '');
                    const replace = process.env[x];
                    dataStr = dataStr.split(find).join(replace);
                });

                body = dataStr;
            }

        }

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