import { buildFunction_http, build_createFunctionJson, build_runFunction_http } from "../../azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType } from "../config/server-config";

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_http({
        route: config.http_route
    })
        // .bindings(t => ({
        //     // outProcessQueue: build_binding<ProcessQueue>(config.getBinding_processQueue())
        // }))
        ;
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_http(buildFunction, async (config: ServerConfigType, context, req) => {
    context.log('START');

    const results = await config.runTests(context.log.bind(context));

    context.res = {
        body: {
            results,
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
});
