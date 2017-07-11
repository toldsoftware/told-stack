import fetch from 'node-fetch';
import { ClientConfigType, DataKey, LookupResponse, LookupData } from "../src-config/client-config";
import { setInterval_exponentialBackoff, clearInterval_exponentialBackoff } from "../../../core/utils/time";

interface NotifyUpdateOptions {
    shouldAutoRefresh: boolean;
}

export class DataAccess<T> {
    constructor(private config: ClientConfigType) { }

    async read(key: DataKey) {
        return readAppBlob<T>(this.config, key);
    }

    async readAndUpdate(key: DataKey, options: NotifyUpdateOptions, notifyUpdate: (newData: T) => void) {
        return readAppBlobAndUpdate<T>(this.config, key, options, notifyUpdate);
    }
}

export async function readAppBlob<T>(config: ClientConfigType, key: DataKey) {
    const { data } = await readAppBlob_inner<T>(config, key);
    return data;
}

export async function readAppBlob_inner<T>(config: ClientConfigType, key: DataKey) {
    const rLookup = await fetch(config.getLookupUrl(key));
    const lookup = await rLookup.json() as LookupResponse;
    if (lookup.error) {
        return { data: null as T, lookup };
    } else {
        return await readAppBlobData<T>(config, key, lookup);
    }
}
export async function readAppBlobData<T>(config: ClientConfigType, key: DataKey, lookup: LookupResponse) {
    const r = await fetch(config.getDataDownloadUrl(key, lookup as LookupData));
    const data = await r.json() as T;
    return { data, lookup };
}

export async function readAppBlobAndUpdate<T>(config: ClientConfigType, key: DataKey, options: NotifyUpdateOptions, notifyUpdate: (newData: T, cancel: () => void) => void) {
    let { data, lookup } = await readAppBlob_inner<T>(config, key);

    if (notifyUpdate) {

        let refreshTimeoutId: any = 0;
        const cancel = () => {
            clearTimeout(refreshTimeoutId);
        };

        const lookupLoop = () => {
            console.log('readAppBlobAndUpdate lookupLoop', { ...lookup });

            const intervalId = setInterval_exponentialBackoff(async () => {
                const rLookup_update = await fetch(config.getLookupUrl(key));
                const lookup_update = await rLookup_update.json() as LookupResponse;

                if (JSON.stringify(lookup_update) !== JSON.stringify(lookup)) {
                    clearInterval_exponentialBackoff(intervalId);

                    if (JSON.stringify(lookup_update.timeKey) !== JSON.stringify(lookup.timeKey)) {
                        const { data } = await readAppBlobData<T>(config, key, lookup_update);
                        notifyUpdate(data, cancel);
                    }

                    lookup = lookup_update;

                    if (options.shouldAutoRefresh) {
                        console.log('readAppBlobAndUpdate AutoRefresh', { ...lookup });
                        refreshTimeoutId = setTimeout(lookupLoop, lookup.timeToExpireSeconds * 1000);
                    }
                }
            }, config.timePollSeconds * 1000, {
                    maxAttempts: config.maxPollCount,
                });
        };

        lookupLoop();

    }

    return data;
}
