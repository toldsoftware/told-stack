import { DataAccess } from "@told/stack/lib/data-patterns/lookup-lsc/src-client/data-access";
import { clientConfig } from '../config/config-lookup-lsc';

export const lookupLscDataAccess = new DataAccess(clientConfig);