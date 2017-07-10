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

export interface ClientConfigOptions {
    timePollSeconds: number;
    maxPollCount: number;
    lookup_domain: string;
    lookup_route: string;
    downloadBlob_domain: string;
    downloadBlob_route: string;
}

export class ClientConfig implements ClientConfigType, ClientConfigOptions {
    timePollSeconds = 1;
    maxPollCount = 5;

    lookup_domain = '/';
    lookup_route = 'api/lookup-lsc';
    downloadBlob_domain = '/';
    downloadBlob_route = 'blob';

    // WARNING: Gzip is not working in the 4th step: Reading from .gzip blob with node and sending to client
    // In addition, since using a function instead of proxy, gzip is done automatically by the function
    // So it is not needed, and would only be useful to reduce storage size at the cost of increased processing
    shouldGzipDownloadBlob = false;

    constructor(options?: Partial<ClientConfigOptions>) {
        Object.assign(this, options);
    }

    getLookupUrl(key: DataKey): string {
        return `${this.lookup_domain}/${this.lookup_route}/${key.containerName}/${key.blobName}`;
    }

    getDataDownloadUrl(key: DataKey, lookup: LookupData): string {
        return `${this.downloadBlob_domain}/${this.downloadBlob_route ? this.downloadBlob_route + '/' : ''}${key.containerName}/${this.getDataDownloadBlobName(key.blobName, lookup)}`;
    }

    getDataDownloadBlobName(blobName: string, lookup: LookupData) {
        // TODO: Test if works with .ext and switch to underscore if needed
        return `${blobName}/${lookup.timeKey}${this.shouldGzipDownloadBlob ? '_gzip' : ''}`;
    }
}
