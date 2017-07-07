import { HttpFunctionRequest } from "../../../core/types/functions";

export interface DataKey {
    containerName: string;
    blobName: string;
}

export type LookupTable = { startTime: number };

export interface DataAccessConfig {
    timePollSeconds: number;
    maxPollCount: number;

    getLookupUrl(key: DataKey): string;
    getDataDownloadUrl(key: DataKey, lookup: LookupTable): string;
}

export interface ChangeTable {
    startTime: number;
}

export interface DataUpdateConfig {
    timeToLiveSeconds: number;
    timeExtendSeconds: number;
    timeExecutionSeconds: number;
    timePollSeconds: number;

    getLookupBlobName(blobName: string): string;
    getDataDownloadBlobName(blobName: string, lookup: LookupTable): string;

    getKeyFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): DataKey;

    getChangeTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage): { table: string, partition: string, row: string };
    getLookupTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage): { table: string, partition: string, row: string };
}

export interface HttpFunction_BindingData {
    container: string;
    blob: string;
}

export interface DataUpdateBlobConfig<T> extends DataUpdateConfig {
    obtainBlobData(oldBlob: T, key: DataKey): Promise<T>;
}

export interface FunctionTemplateConfig {
    http_route: string;

    lookupBlob_connection: string;
    lookupTable_tableName: string;
    lookupTable_partitionKey: string;
    lookupTable_rowKey: string;
    lookupTable_tableName_fromQueueTrigger: string;
    lookupTable_partitionKey_fromQueueTrigger: string;
    lookupTable_rowKey_fromQueueTrigger: string;

    updateRequestQueue_connection: string;
    updateRequestQueue_queueName: string;

    updateExecuteQueue_connection: string;
    updateExecuteQueue_queueName: string;

    changeTable_connection: string;
    changeTable_tableName: string;
    changeTable_partitionKey: string;
    changeTable_rowKey: string;
    changeTable_tableName_fromQueueTrigger: string;
    changeTable_partitionKey_fromQueueTrigger: string;
    changeTable_rowKey_fromQueueTrigger: string;

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
    changeTable_connection = this.default_storageConnectionString_AppSettingName;
    dataRawBlob_connection = this.default_storageConnectionString_AppSettingName;
    dataDownloadBlob_connection = this.default_storageConnectionString_AppSettingName;

    constructor(
        public obtainBlobData: (oldBlob: T, key: DataKey) => Promise<T>,
        private apiRoutePath = 'api/lookup-lsc',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING'
    ) { }

    // Function Template

    // Slash in blobName is not supported (i.e. {*blob}) because table partitionKey/rowKey cannot / in the name
    // http_route = this.apiRoutePath + '/{container}/{*blob}';
    http_route = this.apiRoutePath + '/{container}/{blob}';
    getKeyFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): DataKey {
        const d = bindingData;

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

    lookupTable_tableName = `blobaccess`;
    lookupTable_partitionKey = `{container}_{blob}`;
    lookupTable_rowKey = `lookup`;

    lookupTable_tableName_fromQueueTrigger = `blobaccess`;
    lookupTable_partitionKey_fromQueueTrigger = `{queueTrigger.containerName}_{queueTrigger.blobName}`;
    lookupTable_rowKey_fromQueueTrigger = `lookup`;

    getLookupTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage) {
        return {
            table: this.lookupTable_tableName_fromQueueTrigger
                .replace(/\{queueTrigger\.containerName\}/g, queueTrigger.containerName)
                .replace(/\{queueTrigger\.blobName\}/g, queueTrigger.blobName),
            partition: this.lookupTable_partitionKey_fromQueueTrigger
                .replace(/\{queueTrigger\.containerName\}/g, queueTrigger.containerName)
                .replace(/\{queueTrigger\.blobName\}/g, queueTrigger.blobName),
            row: this.lookupTable_rowKey_fromQueueTrigger
                .replace(/\{queueTrigger\.containerName\}/g, queueTrigger.containerName)
                .replace(/\{queueTrigger\.blobName\}/g, queueTrigger.blobName),
        };
    }

    changeTable_tableName = `blobaccess`;
    changeTable_partitionKey = `{container}_{blob}`;
    changeTable_rowKey = `change`;

    changeTable_tableName_fromQueueTrigger = `blobaccess`;
    changeTable_partitionKey_fromQueueTrigger = `{queueTrigger.containerName}_{queueTrigger.blobName}`;
    changeTable_rowKey_fromQueueTrigger = `change`;

    getChangeTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage) {
        return {
            table: this.changeTable_tableName_fromQueueTrigger
                .replace(/\{queueTrigger\.containerName\}/g, queueTrigger.containerName)
                .replace(/\{queueTrigger\.blobName\}/g, queueTrigger.blobName),
            partition: this.changeTable_partitionKey_fromQueueTrigger
                .replace(/\{queueTrigger\.containerName\}/g, queueTrigger.containerName)
                .replace(/\{queueTrigger\.blobName\}/g, queueTrigger.blobName),
            row: this.changeTable_rowKey_fromQueueTrigger
                .replace(/\{queueTrigger\.containerName\}/g, queueTrigger.containerName)
                .replace(/\{queueTrigger\.blobName\}/g, queueTrigger.blobName),
        };
    }

    dataRawBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}`;
    dataDownloadBlob_path_fromQueueTriggerDate = `{queueTrigger.containerName}/{queueTrigger.blobName}/{queueTrigger.startTime}.gzip`;

    getLookupUrl(key: DataKey): string {
        return `${this.domain}/${this.apiRoutePath}/${key.containerName}/${key.blobName}`;
    }

    getDataDownloadUrl(key: DataKey, lookup: LookupTable): string {
        return `${this.domain}/${this.blobProxyRoutePath}/${key.containerName}/${this.getDataDownloadBlobName(key.blobName, lookup)}`;
    }

    getLookupBlobName(blobName: string) {
        return `${blobName}/_lookup.txt`;
    }

    getDataDownloadBlobName(blobName: string, lookup: LookupTable) {
        // TODO: Test if works with .ext and switch to underscore if needed
        return `${blobName}/${lookup.startTime}.gzip`;
    }
}