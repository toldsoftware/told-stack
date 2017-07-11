export class ClientConfig {
    timeBatchSeconds: 60;

    sendLog_domain = '/';
    sendLog_route = 'api/send-log';

    getSendLogUrl = () => this.sendLog_domain + this.sendLog_route;
}

