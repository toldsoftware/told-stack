import { HttpFunctionRequest, HttpFunctionRequest_ClientInfo, HttpFunctionResponse } from "../../../core/types/functions";
import { FunctionTemplateConfig, ServerConfigType, ProcessQueue, HttpFunction_BindingData_Status, StripeCheckoutTable, HttpFunction_BindingData, StripeWebhookRequestBody, StripeWebhookData, StripeWebhookQueue } from "../config/server-config";

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                // This requires a code be sent by stripe, we will do manual verification instead
                // webhookType: "genericJson",
                direction: "in",
                authLevel: "anonymous",
                route: config.webhook_route
            },
            {
                name: "res",
                type: "http",
                direction: "out"
            },
            {
                name: "outWebhookQueue",
                type: "queue",
                direction: "out",
                queueName: config.webhookQueue_queueName,
                connection: config.storageConnection
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
        outWebhookQueue: StripeWebhookQueue,
    }
}, req: HttpFunctionRequest<StripeWebhookRequestBody>) {
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
};
