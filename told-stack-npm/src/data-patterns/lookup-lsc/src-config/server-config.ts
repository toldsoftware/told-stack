import { HttpFunctionRequest } from "../../../core/types/functions";
import { DataKey, LookupData, ClientConfig } from "./client-config";
export { DataKey, LookupData };

export interface ChangeData {
    changeTime: number;
}

export interface ServerConfigType {
    timeToLiveSeconds: number;
    timeExtendSeconds: number;
    timeExecutionSeconds: number;
    timePollSeconds: number;

    getDataDownloadBlobName(blobName: string, lookup: LookupData): string;

    getKeyFromRequest(req: HttpFunctionRequest, bindingData: HttpFunction_BindingData): DataKey;

    getChangeTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage): { table: string, partition: string, row: string };
    getLookupTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage): { table: string, partition: string, row: string };

    obtainBlobData(oldBlob: any, key: DataKey): Promise<any>;
}

export interface HttpFunction_BindingData {
    container: string;
    blob: string;
}

export interface FunctionTemplateConfig {
    http_route: string;

    lookupTable_connection: string;
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
    timeKey: string;
}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {
    timeToLiveSeconds = 60;
    timeExtendSeconds = 1;
    timeExecutionSeconds = 10;
    timePollSeconds = this.clientConfig.timePollSeconds;

    updateRequestQueue_connection = this.default_storageConnectionString_AppSettingName;
    updateExecuteQueue_connection = this.default_storageConnectionString_AppSettingName;
    lookupTable_connection = this.default_storageConnectionString_AppSettingName;
    changeTable_connection = this.default_storageConnectionString_AppSettingName;
    dataRawBlob_connection = this.default_storageConnectionString_AppSettingName;
    dataDownloadBlob_connection = this.default_storageConnectionString_AppSettingName;

    // Slash in blobName is not supported (i.e. {*blob}) because table partitionKey/rowKey cannot / in the name
    // http_route = this.apiRoutePath + '/{container}/{*blob}';
    http_route = this.clientConfig.apiRoutePath + '/{container}/{blob}';
    getDataDownloadBlobName = this.clientConfig.getDataDownloadBlobName;
    dataRawBlob_path_fromQueueTrigger = `{containerName}/{blobName}`;
    dataDownloadBlob_path_fromQueueTriggerDate = `{containerName}/{blobName}/{timeKey}.gzip`;

    constructor(
        private clientConfig: ClientConfig,
        public obtainBlobData: <T>(oldBlob: T, key: DataKey) => Promise<T>,
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING'
    ) { }

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

    lookupTable_tableName = `blobaccess`;
    lookupTable_partitionKey = `{container}_{blob}`;
    lookupTable_rowKey = `lookup`;

    lookupTable_tableName_fromQueueTrigger = `blobaccess`;
    lookupTable_partitionKey_fromQueueTrigger = `{containerName}_{blobName}`;
    lookupTable_rowKey_fromQueueTrigger = `lookup`;

    getLookupTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage) {
        return {
            table: this.lookupTable_tableName_fromQueueTrigger
                .replace(/\{containerName\}/g, queueTrigger.containerName)
                .replace(/\{blobName\}/g, queueTrigger.blobName),
            partition: this.lookupTable_partitionKey_fromQueueTrigger
                .replace(/\{containerName\}/g, queueTrigger.containerName)
                .replace(/\{blobName\}/g, queueTrigger.blobName),
            row: this.lookupTable_rowKey_fromQueueTrigger
                .replace(/\{containerName\}/g, queueTrigger.containerName)
                .replace(/\{blobName\}/g, queueTrigger.blobName),
        };
    }

    changeTable_tableName = `blobaccess`;
    changeTable_partitionKey = `{container}_{blob}`;
    changeTable_rowKey = `change`;

    changeTable_tableName_fromQueueTrigger = `blobaccess`;
    changeTable_partitionKey_fromQueueTrigger = `{containerName}_{blobName}`;
    changeTable_rowKey_fromQueueTrigger = `change`;

    getChangeTableRowKey_fromQueueTrigger(queueTrigger: UpdateRequestQueueMessage) {
        return {
            table: this.changeTable_tableName_fromQueueTrigger
                .replace(/\{containerName\}/g, queueTrigger.containerName)
                .replace(/\{blobName\}/g, queueTrigger.blobName),
            partition: this.changeTable_partitionKey_fromQueueTrigger
                .replace(/\{containerName\}/g, queueTrigger.containerName)
                .replace(/\{blobName\}/g, queueTrigger.blobName),
            row: this.changeTable_rowKey_fromQueueTrigger
                .replace(/\{containerName\}/g, queueTrigger.containerName)
                .replace(/\{blobName\}/g, queueTrigger.blobName),
        };
    }

}