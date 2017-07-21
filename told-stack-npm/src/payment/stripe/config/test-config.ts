import { ClientConfig } from "./client-config";
import { ServerConfig, FunctionTemplateConfig } from "./server-config";

export class TestConfig {
    public functionConfig = this.serverConfig as FunctionTemplateConfig;

    constructor(
        public clientConfig: ClientConfig,
        public serverConfig: ServerConfig,
        public options: {
            shouldUseNewProduct: boolean
        },
    ) {

    }
}