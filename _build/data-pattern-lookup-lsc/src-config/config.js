"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor(obtainBlobData) {
        this.obtainBlobData = obtainBlobData;
        this.timeStaleSeconds = 60;
        this.timeExtendSeconds = 10;
        this.timeExecutionSeconds = 10;
        this.timePollSeconds = 15;
        this.maxPollCount = 3;
        this.domain = '/';
        this.apiRoutePath = 'api/lookup-lsc';
        this.blobProxyRoutePath = 'blob';
        // Function Template
        this.http_route = this.apiRoutePath + '/{container}/{blob}';
        this.updateRequestQueue_queueName = 'lookup-lsc-update-request-queue';
        this.updateExecuteQueue_queueName = 'lookup-lsc-update-execute-queue';
        // These will encode to a url that receives parametes
        // Example: '{container}/{blob}/_lookup.txt'
        this.lookupBlob_path = `{container}/${this.getLookupBlobName('{blob}')}`;
        this.changingBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}/changing`;
        this.dataRawBlob_path_fromQueueTrigger = `{queueTrigger.containerName}/{queueTrigger.blobName}`;
    }
    getKeyFromRequest(req, bindingData) {
        const d = bindingData;
        return {
            containerName: d.container,
            blobName: d.blob,
        };
    }
    getLookupUrl(key) {
        return `${this.domain}/${this.apiRoutePath}/${key.containerName}/${key.blobName}`;
    }
    getDataDownloadUrl(key, lookup) {
        return `${this.domain}/${this.blobProxyRoutePath}/${key.containerName}/${this.getDataDownloadBlobName(key.blobName, lookup)}`;
    }
    getLookupBlobName(blobName) {
        return `${blobName}/_lookup.txt`;
    }
    getDataDownloadBlobName(blobName, lookup) {
        // TODO: Test if works with .ext and switch to underscore if needed
        return `${blobName}/${lookup}.gzip`;
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map