import { HttpFunctionRequest } from "../../../core/types/functions";

export interface DataKey {
    containerName: string;
    blobName: string;
}

export interface LookupData {
    timeKey: string
};

export interface ClientConfigType {
    timePollSeconds: number;
    maxPollCount: number;

    getLookupUrl(key: DataKey): string;
    getDataDownloadUrl(key: DataKey, lookup: LookupData): string;
}

export class ClientConfig implements ClientConfigType {
    timePollSeconds = 1;
    maxPollCount = 5;

    constructor(
        public domain = '/',
        public apiRoutePath = 'api/lookup-lsc',
        public blobProxyRoutePath = 'blob',
    ) { }

    getLookupUrl(key: DataKey): string {
        return `${this.domain}/${this.apiRoutePath}/${key.containerName}/${key.blobName}`;
    }

    getDataDownloadUrl(key: DataKey, lookup: LookupData): string {
        return `${this.domain}/${this.blobProxyRoutePath}/${key.containerName}/${this.getDataDownloadBlobName(key.blobName, lookup)}`;
    }

    getDataDownloadBlobName(blobName: string, lookup: LookupData) {
        // TODO: Test if works with .ext and switch to underscore if needed
        return `${blobName}/${lookup.timeKey}.gzip`;
    }
}
