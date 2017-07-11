import { ServerConfig } from "@told/stack/src/data-patterns/lookup-lsc/src-config/server-config";
import { clientConfig } from './client';
import { obtainTestBlobData } from '../../../src-server/src/obtain-test-blob-data';

export const config = new ServerConfig(clientConfig, obtainTestBlobData);

// // Test Fast Change
// config.timeToLiveSeconds = 1;
// config.timeExtendSeconds = 1;
// config.timeExecutionSeconds = 1;