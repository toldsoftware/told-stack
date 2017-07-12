import { ServerConfig } from "@told/stack/src/core/logger/config/server-config";
import { clientConfig } from './logger-client';

export const config = new ServerConfig(clientConfig);
