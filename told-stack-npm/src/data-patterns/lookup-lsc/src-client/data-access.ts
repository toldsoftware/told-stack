import fetch from 'node-fetch';
import { ClientConfigType, DataKey, LookupData } from "../src-config/client-config";
import { setInterval_exponentialBackoff, clearInterval_exponentialBackoff } from "../../../core/utils/time";

export class DataAccess {
    constructor(private config: ClientConfigType) { }

    async read(key: DataKey) {
        return readAppBlob(this.config, key);
    }

    async readAndUpdate(key: DataKey, notifyUpdate: () => void) {
        return readAppBlobAndUpdate(this.config, key, notifyUpdate);
    }
}

export async function readAppBlob<T>(config: ClientConfigType, key: DataKey) {
    const { data } = await readAppBlob_inner<T>(config, key);
    return data;
}

export async function readAppBlob_inner<T>(config: ClientConfigType, key: DataKey) {
    const rLookup = await fetch(config.getLookupUrl(key));
    const lookup = await rLookup.json() as LookupData;
    const r = await fetch(config.getDataDownloadUrl(key, lookup));
    const data = await r.json() as T;
    return { data, lookup };
}

export async function readAppBlobAndUpdate<T>(config: ClientConfigType, key: DataKey, notifyUpdate: () => void) {
    const { data, lookup } = await readAppBlob_inner<T>(config, key);

    if (notifyUpdate) {

        const intervalId = setInterval_exponentialBackoff(async () => {
            const rLookup_update = await fetch(config.getLookupUrl(key));
            const lName_update = await rLookup_update.json() as LookupData;

            if (JSON.stringify(lName_update) !== JSON.stringify(lookup)) {
                clearInterval_exponentialBackoff(intervalId);
                notifyUpdate();
            }
        }, config.timePollSeconds * 1000, config.maxPollCount);

    }

    return data;
}
