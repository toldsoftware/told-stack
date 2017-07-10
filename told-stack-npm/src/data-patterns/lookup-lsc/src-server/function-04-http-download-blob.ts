import { createFunctionJson as createFunctionJson_inner, runFunction as runFunction_inner } from "../../http-input-blob/src-server/function-01-http";
import { ServerConfig, FunctionTemplateConfig } from "../src-config/server-config";
import { HttpFunctionRequest } from "../../../core/types/functions";

export function createFunctionJson(config: FunctionTemplateConfig) {
    return createFunctionJson_inner({
        http_route: config.http_dataDownload_route,
        inputBlob_connection: config.dataDownloadBlob_connection,
        inputBlob_path: config.dataDownloadBlob_path_from_http_dataDownload_route,
    });
}

export async function runFunction(config: ServerConfig, context: any, req: HttpFunctionRequest) {
    return runFunction_inner({
        responseOptions: {
            cacheControl: 'public, max-age: ' + (config.timeToLiveSeconds * 4),
            contentEncoding: 'gzip',
            contentType: 'application/json',
        }
    }, context, req);
};
