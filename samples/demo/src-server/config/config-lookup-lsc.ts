import { ServerConfig } from "@told/stack/lib/data-patterns/lookup-lsc/src-config/server-config";
import { clientConfig } from '../../src-client/config/config-lookup-lsc';

export const config = new ServerConfig(clientConfig, async () => { return { data: 'TEST ' + new Date() } as any; });
