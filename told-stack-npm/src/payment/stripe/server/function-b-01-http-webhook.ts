import { build_runFunction_http, build_createFunctionJson, build_binding, buildFunction_http } from "../../../core/azure-functions/function-builder";
import { FunctionTemplateConfig, ServerConfigType, StripeWebhookRequestBody, StripeWebhookData, StripeWebhookQueue } from "../config/server-config";
    
export const deps = {
};

function buildFunction(config: FunctionTemplateConfig) {
    return buildFunction_http({
        route: config.webhook_route,
    })
        .bindings(t => ({
            outWebhookQueue: build_binding<StripeWebhookQueue>(config.getBinding_stripeWebhookQueue())
        }));
}

export const createFunctionJson = (config: FunctionTemplateConfig) => build_createFunctionJson(config, buildFunction);

export const runFunction = build_runFunction_http(buildFunction, (config: ServerConfigType, context, req) => {
    context.log('START');

    const stripeSignature = req.headers['stripe-signature'];
    context.bindings.outWebhookQueue = {
        body: req.body,
        stripeSignature,
    };

    context.res = {
        status: 200,
        body: {
            ok: true,
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    context.log('DONE');
    context.done();
});
