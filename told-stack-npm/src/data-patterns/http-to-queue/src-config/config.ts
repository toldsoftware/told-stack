import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
    outputQueue_queueName: string;
}

export interface HttpFunction_Config {
    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): OutputQueueMessage;
}

export interface HttpFunction_BindingData {
    key: string;
}

export interface OutputQueueMessage {
    key: string;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {
    constructor(public http_routeRoot = 'api/http-to-queue') { }

    http_route = this.http_routeRoot + '/{key}';
    outputQueue_queueName = 'http-to-queue-output-queue';

    getDataFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData) {
        return { key: bindingData.key, value: req.body };
    }
}