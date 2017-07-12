import { assignPartial } from "../../utils/objects";

export interface ClientConfigOptions {
    timeBatchSeconds: number;

    sendLog_domain: string;
    sendLog_route: string;
}

export class ClientConfig {
    timeBatchSeconds: 60;
    maxItemSendAttempts: 3;
    maxSendSize = 32 * 1024;
    maxDataSize = 28 * 1024;

    sendLog_domain = '/';
    sendLog_route = 'api/logger/send-log';

    constructor(options: Partial<ClientConfigOptions>) {
        assignPartial(this, options);
    }

    getSendLogUrl = () => `${this.sendLog_domain}/${this.sendLog_route}`;


}

