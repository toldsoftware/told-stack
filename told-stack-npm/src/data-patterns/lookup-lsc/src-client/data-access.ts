import fetch from 'node-fetch';
import { DataAccessConfig, DataKey, LookupTable } from "../src-config/config";
import { setInterval_exponentialBackoff, clearInterval_exponentialBackoff } from "../../../core/utils/time";

export class DataAccess {
    constructor(private config: DataAccessConfig) { }

    async read(key: DataKey) {
        return readAppBlob(this.config, key);
    }

    async readAndUpdate(key: DataKey, notifyUpdate: () => void) {
        return readAppBlobAndUpdate(this.config, key, notifyUpdate);
    }
}

export async function readAppBlob<T>(config: DataAccessConfig, key: DataKey) {
    const { data } = await readAppBlob_inner<T>(config, key);
    return data;
}

export async function readAppBlob_inner<T>(config: DataAccessConfig, key: DataKey) {
    const rLookup = await fetch(config.getLookupUrl(key));
    const lookup = await rLookup.json() as LookupTable;
    const r = await fetch(config.getDataDownloadUrl(key, lookup));
    const data = await r.json() as T;
    return { data, lookup };
}

export async function readAppBlobAndUpdate<T>(config: DataAccessConfig, key: DataKey, notifyUpdate: () => void) {
    const { data, lookup } = await readAppBlob_inner<T>(config, key);

    if (notifyUpdate) {

        const intervalId = setInterval_exponentialBackoff(async () => {
            const rLookup_update = await fetch(config.getLookupUrl(key));
            const lName_update = await rLookup_update.json() as LookupTable;

            if (JSON.stringify(lName_update) !== JSON.stringify(lookup)) {
                clearInterval_exponentialBackoff(intervalId);
                notifyUpdate();
            }
        }, config.timePollSeconds * 1000, config.maxPollCount);

    }

    return data;
}
