export interface DataKey {
    containerName: string;
    blobName: string;
}

export interface DataAccessConfig {
    timePollSeconds: number;
    maxPollCount: number;

    getLookupUrl(key: DataKey): string;
    getDataDownloadUrl(key: DataKey, lookup: string): string;
}

export interface DataUpdateConfig {
    timeStaleSeconds: number;
    timeExtendSeconds: number;
    timeExecutionSeconds: number;
    timePollSeconds: number;

    getLookupBlobName(blobName: string): string;
    getDataDownloadBlobName(blobName: string, lookup: string): string;

    getKeyFromRequest(req: HttpFunctionRequest, bindingData: any): DataKey;

    obtainBlobData<T>(oldBlob: T, key: DataKey): Promise<T>;
}

export interface FunctionTemplateConfig {
    http_route: string;
    lookupBlob_path: string;
    updateRequestQueue_queueName: string;
    updateExecuteQueue_queueName: string;
    changingBlob_path_fromQueueTrigger: string;
    dataRawBlob_path_fromQueueTrigger: string;
}

export interface UpdateRequestQueueMessage extends DataKey {

}

export class Config implements DataAccessConfig, DataUpdateConfig, FunctionTemplateConfig {
    timeStaleSeconds = 60;
    timeExtendSeconds = 10;
    timeExecutionSeconds = 10;

    timePollSeconds = 15;
    maxPollCount = 3;

    domain = '/';
    apiRoutePath = 'api/lookup-lsc';
    blobProxyRoutePath = 'blob';

    constructor(public obtainBlobData: <T>(oldBlob: T, key: DataKey) => Promise<T>) {

    }

    // Function Template
    http_route = this.apiRoutePath + '/{container}/{blob}';
    getKeyFromRequest(req: HttpFunctionRequest, bindingData: any): DataKey {
        const d = bindingData as {
            container: string,
            blob: string,
        };

        return {
            containerName: d.container,
            blobName: d.blob,
        };
    }

    updateRequestQueue_queueName = 'lookup-lsc-update-request-queue';
    updateExecuteQueue_queueName = 'lookup-lsc-update-execute-queue';
    // These will encode to a url that receives parametes
    // Example: '{container}/{blob}/_lookup.txt'

    lookupBlob_path = `{container}/${this.getLookupBlobName('{blob}')}`;
    changingBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}/changing`;
    dataRawBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}`;

    getLookupUrl(key: DataKey): string {
        return `${this.domain}/${this.apiRoutePath}/${key.containerName}/${key.blobName}`;
    }

    getDataDownloadUrl(key: DataKey, lookup: string): string {
        return `${this.domain}/${this.blobProxyRoutePath}/${key.containerName}/${this.getDataDownloadBlobName(key.blobName, lookup)}`;
    }

    getLookupBlobName(blobName: string) {
        return `${blobName}/_lookup.txt`;
    }

    getDataDownloadBlobName(blobName: string, lookup: string) {
        // TODO: Test if works with .ext and switch to underscore if needed
        return `${blobName}/${lookup}.gzip`;
    }
}