import { FunctionTemplateConfig, HttpFunction_BindingData, HttpFunction_DownloadBlob_BindingData, ServerConfigType } from "../src-config/server-config";
import { HttpFunctionRequest, HttpFunctionResponse } from "../../../core/types/functions";
import { readBlobBuffer } from "../../../core/utils/azure-storage-sdk/blobs";

export function createFunctionJson(config: FunctionTemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                direction: "in",
                authLevel: "anonymous",
                route: config.http_dataDownload_route
            },
            {
                name: "res",
                type: "http",
                direction: "out"
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: ServerConfigType, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_DownloadBlob_BindingData,
    bindings: {}
}, req: HttpFunctionRequest) {
    context.log('http-download-blob START');
    const data = await readBlobBuffer<any>(context.bindingData.containerName, context.bindingData.blobName + '/' + context.bindingData.timeKeyWithGzip);
    context.log('http-download-blob', data);
    context.res = {
        body: data,
        headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': config.shouldGzip ? 'gzip' : undefined,
            'Cache-Control': `public, max-age=${config.timeToLiveSeconds_downloadBlob}`,
        }
    };
    context.done();
};
