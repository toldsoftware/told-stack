import { buildFunction_http, build_binding, build_runFunction_http, build_createFunctionJson } from "../../azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, HttpFunction_BindingData, LogQueue } from "../config/server-config";
import { LogItem, LogRequestBody, LogResponseBody } from "../config/types";
import { group, groupToArray } from "../../utils/objects";
import { HttpFunctionRequest_ClientInfo } from "../../types/functions";

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_http<LogResponseBody>({
        route: config.http_route
    })
        .bindings(t => ({
            outLogQueue: build_binding<LogQueue[]>(config.getBinding_logQueue())
        }));
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_http(buildFunction, (config: ServerConfigType, context, req) => {
    context.log('START');

    // Only Supports Max Queue Size (64kb)
    const d = config.httpProvider.parseRequest<LogRequestBody>(req.body);
    if (!d.data) {
        // Ignore Verification failure (Just for logging for now)
        d.data = d.data_ignoreVerificationError;

        // context.res = {
        //     body: {
        //         ok: false,
        //         error: 'Failed to Parse Request'
        //     },
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // };

        // context.log('DONE');
        // context.done();
        // return;
    }

    const items = d.data.items;

    if (!items) {
        context.res = {
            body: {
                ok: false,
                error: 'No Items Sent'
            },
            headers: {
                'Content-Type': 'application/json',
            }
        };

        context.log('DONE');
        context.done();
        return;
    }

    context.log(`Received ${items.length} log items`);

    const c = req as any as HttpFunctionRequest_ClientInfo;
    const requestInfo = items.some(x => !!x.deviceInfo) ? {
        originalUrl: c.originalUrl,
        method: c.method,
        query: c.query,
        headers: c.headers
    } : undefined;

    const clientInfo = {
        ip: c.headers['x-forwarded-for'],
        userAgent: c.headers['user-agent'],
    };

    const groupByUserId = groupToArray(items, x => x.sessionInfo.userId_claimed);

    context.bindings.outLogQueue = groupByUserId.map(g => ({
        items: g,
        sessionToken: items[0].sessionInfo.sessionToken || '',
        userId_claimed: items[0].sessionInfo.userId_claimed || '',
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        requestInfo,
    }));

    context.log(`Stored in Queue`);

    context.res = {
        body: {
            ok: true
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
});
