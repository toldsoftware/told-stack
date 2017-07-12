import { ClientConfig } from "@told/stack/src/core/logger/config/client-config";

export const clientConfig = new ClientConfig({
    timeBatchSeconds: 10,
    sendLog_domain: 'https://told-stack-demo.azureedge.net',
    // sendLog_domain: 'http://localhost:7071',
    sendLog_route: 'api/logger/send-log',
});