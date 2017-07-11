import { DataAccess } from '@told/stack/src/data-patterns/lookup-lsc/src-client/data-access';
import { clientConfig_lookupLsc as clientConfig } from '../../config';

export const lookupLscDataAccess = new DataAccess(clientConfig);