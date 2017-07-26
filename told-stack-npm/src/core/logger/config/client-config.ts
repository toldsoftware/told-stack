import { assignPartial } from "../../utils/objects";
import { LogRequestBody, LogResponseBody } from "./types";
import { HttpProvider, HttpProvider_Client } from "../../providers/http-provider";
import { httpProvider_default } from "../../providers/http-provider-default";

export interface ClientConfigOptions {
    httpProvider: HttpProvider;
    timeBatchSeconds?: number;
}

export class ClientConfig {
    timeBatchSeconds: 60;
    maxItemSendAttempts: 3;
    maxSendSize = 32 * 1024;
    maxDataSize = 28 * 1024;

    sendLog_domain = '/';
    sendLog_route = 'api/logger/send-log';

    httpProvider: HttpProvider_Client;

    constructor(options: ClientConfigOptions) {
        assignPartial(this as any, options);
    }

    getSendLogUrl = () => `${this.sendLog_domain}/${this.sendLog_route}`;
}

