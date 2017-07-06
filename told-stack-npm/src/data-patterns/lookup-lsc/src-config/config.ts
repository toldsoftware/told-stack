import { HttpFunctionRequest } from "../../../core/types/functions";

export interface DataKey {
    containerName: string;
    blobName: string;
}

export type LookupBlob = { startTime: number };

export interface DataAccessConfig {
    timePollSeconds: number;
    maxPollCount: number;

    getLookupUrl(key: DataKey): string;
    getDataDownloadUrl(key: DataKey, lookup: LookupBlob): string;
}

export interface ChangeBlob {
    startTime: number;
}

export interface DataUpdateConfig {
    timeToLiveSeconds: number;
    timeExtendSeconds: number;
    timeExecutionSeconds: number;
    timePollSeconds: number;

    getLookupBlobName(blobName: string): string;
    getDataDownloadBlobName(blobName: string, lookup: LookupBlob): string;

    getKeyFromRequest(req: HttpFunctionRequest, bindingData: any): DataKey;
}

export interface DataUpdateBlobConfig<T> extends DataUpdateConfig {
    obtainBlobData(oldBlob: T, key: DataKey): Promise<T>;
}

export interface FunctionTemplateConfig {
    http_route: string;

    lookupBlob_connection: string;
    lookupBlob_path: string;

    updateRequestQueue_connection: string;
    updateRequestQueue_queueName: string;

    updateExecuteQueue_connection: string;
    updateExecuteQueue_queueName: string;

    changeBlob_connection: string;
    changeBlob_path: string;
    changeBlob_path_fromQueueTrigger: string;

    dataRawBlob_connection: string;
    dataRawBlob_path_fromQueueTrigger: string;

    dataDownloadBlob_connection: string;
    dataDownloadBlob_path_fromQueueTriggerDate: string;
}

export interface UpdateRequestQueueMessage extends DataKey {
    startTime: number;
}

export class Config<T> implements DataAccessConfig, DataUpdateConfig, FunctionTemplateConfig {
    timeToLiveSeconds = 60;
    timeExtendSeconds = 10;
    timeExecutionSeconds = 10;

    timePollSeconds = 15;
    maxPollCount = 3;

    domain = '/';
    blobProxyRoutePath = 'blob';

    lookupBlob_connection = this.default_storageConnectionString_AppSettingName;
    updateRequestQueue_connection = this.default_storageConnectionString_AppSettingName;
    updateExecuteQueue_connection = this.default_storageConnectionString_AppSettingName;
    changeBlob_connection = this.default_storageConnectionString_AppSettingName;
    dataRawBlob_connection = this.default_storageConnectionString_AppSettingName;
    dataDownloadBlob_connection = this.default_storageConnectionString_AppSettingName;

    constructor(
        public obtainBlobData: (oldBlob: T, key: DataKey) => Promise<T>,
        private apiRoutePath = 'api/lookup-lsc',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING'
    ) { }

    // Function Template
    http_route = this.apiRoutePath + '/{container}/{*blob}';
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

    lookupBlob_path = `{container}/{blob}/_lookup.txt`;
    changeBlob_path = `{container}/{blob}/changing`;
    changeBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}/changing`;
    dataRawBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}`;
    dataDownloadBlob_path_fromQueueTriggerDate = `{queueTrigger.containerName}/{queueTrigger.blobName}/{queueTrigger.startTime}.gzip`;

    getLookupUrl(key: DataKey): string {
        return `${this.domain}/${this.apiRoutePath}/${key.containerName}/${key.blobName}`;
    }

    getDataDownloadUrl(key: DataKey, lookup: LookupBlob): string {
        return `${this.domain}/${this.blobProxyRoutePath}/${key.containerName}/${this.getDataDownloadBlobName(key.blobName, lookup)}`;
    }

    getLookupBlobName(blobName: string) {
        return `${blobName}/_lookup.txt`;
    }

    getDataDownloadBlobName(blobName: string, lookup: LookupBlob) {
        // TODO: Test if works with .ext and switch to underscore if needed
        return `${blobName}/${lookup.startTime}.gzip`;
    }
}