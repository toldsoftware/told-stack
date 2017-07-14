import { HttpFunctionRequest } from "../../../core/types/functions";

export interface HttpFunction_TemplateConfig {
    http_route: string;
}

export interface HttpFunction_Config {
    getPongUrls(): { name: string, url: string }[];
}

export interface HttpFunction_BindingData {
    path: string;
}

export interface InputData {
    key: HttpFunction_BindingData;
    value: any;
}

export class Config<T> implements HttpFunction_TemplateConfig, HttpFunction_Config {

    endpoints = [
        'scus',
        'sbrazil',
        'seasia',
        'seaustralia',
        'weurope',
    ];

    getPongUrls() {

        const urls: { name: string, url: string }[] = [];

        this.endpoints.forEach(x => {
            urls.push(
                {
                    name: `${x}-normal`,
                    url: `https://test-latency-${x}.azurewebsites.net/api/pong/${0 | 100000 * Math.random()}`
                },
                {
                    name: `${x}--proxy`,
                    url: `https://test-latency-scus.azurewebsites.net/${x}/api/pong/${0 | 100000 * Math.random()}`
                },
                {
                    name: `${x}-prxcdn`,
                    url: `https://test-latency-scus.azureedge.net/${x}/api/pong/${0 | 100000 * Math.random()}`
                },
                {
                    name: `${x}-vercdn`,
                    url: `https://test-latency-${x}.azureedge.net/api/pong/${0 | 100000 * Math.random()}`
                },
                {
                    name: `${x}-precdn`,
                    url: `https://test-latency-${x}-prem.azureedge.net/api/pong/${0 | 100000 * Math.random()}`
                },
                {
                    name: `${x}-akacdn`,
                    url: `https://test-latency-${x}-aka.azureedge.net/api/pong/${0 | 100000 * Math.random()}`
                },
            );
        });
        return urls;

    }

    constructor(
        public http_routeRoot = 'api/ping-pong',
        public default_storageConnectionString_AppSettingName = 'AZURE_STORAGE_CONNECTION_STRING') { }

    http_route = this.http_routeRoot + '/{*path}';

}