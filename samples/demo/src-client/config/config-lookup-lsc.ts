import { ClientConfig } from "@told/stack/src/data-patterns/lookup-lsc/src-config/client-config";

export const clientConfig = new ClientConfig({
    lookup_domain: 'https://told-stack-demo.azurewebsites.net',
    lookup_route: 'api/lookup-lsc',
    downloadBlob_domain: 'https://told-stack-demo.azurewebsites.net',
    downloadBlob_route: 'api/lookup-lsc-download'
});