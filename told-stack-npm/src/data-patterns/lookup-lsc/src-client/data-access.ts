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

    async readAndUpdate(key: DataKey, options: NotifyUpdateOptions, notifyUpdate: (newData: T, timeToExpireSeconds: number, cancel: () => void) => void) {
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

export async function readAppBlobAndUpdate<T>(config: ClientConfigType, key: DataKey, options: NotifyUpdateOptions, notifyUpdate: (newData: T, timeToExpireSeconds: number, cancel: () => void) => void) {
    let { data, lookup } = await readAppBlob_inner<T>(config, key);

    if (notifyUpdate) {

        let refreshIntervalId: any = 0;
        const cancel = () => {
            clearInterval(refreshIntervalId);
            clearInterval_exponentialBackoff(refreshIntervalId);
        };

        const lookupLoop = async () => {
            console.log('readAppBlobAndUpdate lookupLoop');
            const lookup_old = lookup;

            const rLookup_update = await fetch(config.getLookupUrl(key));
            lookup = await rLookup_update.json() as LookupResponse;

            if (JSON.stringify(lookup_old) !== JSON.stringify(lookup)) {
                if (JSON.stringify(lookup_old.timeKey) !== JSON.stringify(lookup.timeKey)) {
                    if (lookup.error) {
                        notifyUpdate(null, lookup.timeToExpireSeconds, cancel);
                    } else {
                        const { data } = await readAppBlobData<T>(config, key, lookup);
                        try {
                            notifyUpdate(data, lookup.timeToExpireSeconds, cancel);
                        } catch (err) {
                            console.error('readAppBlobAndUpdate notifyUpdate ERROR', { err });
                        }
                    }
                }


                if (options.shouldAutoRefresh) {
                    console.log('readAppBlobAndUpdate AutoRefresh', { ...lookup });
                    cancel();
                    refreshIntervalId = setInterval(lookupLoop, lookup.timeToExpireSeconds * 1000);
                }
            }

        };

        console.log('readAppBlobAndUpdate Loop Start', { ...lookup });
        refreshIntervalId = setInterval_exponentialBackoff(lookupLoop, lookup.timeToExpireSeconds * 1000 / (1 + 2 + 4), { maxTime: config.timeToLiveSeconds * 1000 });
    }

    return data;
}
