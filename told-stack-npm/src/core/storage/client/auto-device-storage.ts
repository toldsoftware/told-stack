import { Storage } from './storage';
import { StoreBase } from "./store-base";

const version = 'v0_2';

// export interface AutoDeviceStorage<T> {
//     value: T | Promise<T>;
//     // get value(): Promise<T>;
//     // set value(v: T): Promise<void>;
// }

export function autoDeviceStorage<T>(store: StoreBase | { trigger: () => void }, key: string, defaultValue: T = null): AutoDeviceStorage<T> {

    return new AutoDeviceStorage(() => (store as any).trigger(), key, defaultValue);
    // {
    //         getValue: async () => {
    //             return cache = cache || JSON.parse(await Storage.getItem_noMemCache(key));
    //         },
    //         setValue: async (v: T) => {
    //             cache = v;
    //             return await Storage.setItem_noMemCache(key, JSON.stringify(v));
    //         },
    //     };
}

export class AutoDeviceStorage<T>{
    private _propKey: string;
    private _cache: T = undefined;

    constructor(private onValueLoaded: () => void, private key: string, private defaultValue: T) {
        this._propKey = version + this.key + '__auto';
        const startLoading = this.getValue();
        console.log('AutoDeviceStorage CTOR END', { key, defaultValue, cache: this._cache });
    }

    getValue(): Promise<T> {
        return new Promise((resolve) => {
            if (this._cache !== undefined) {
                resolve(this._cache);
                return;
            }

            Storage.getItem_noMemCache(this._propKey).then(x => {
                if (this._cache !== undefined) {
                    console.warn('AutoDeviceStorage SKIP LOAD: Value was set before loading', { key: this.key, ignoredValue: x, cache: this._cache });
                    return;
                }

                console.log('AutoDeviceStorage LOAD', { key: this.key, value: x, cache: this._cache });
                resolve(this._cache = JSON.parse(x));
                this.onValueLoaded();
            });
        });
    }

    get value_sync(): T {
        return this._cache || this.defaultValue;
    }

    // get value() {
    //     if (!this._cache) {
    //         throw 'The value has not been loaded yet';
    //     }

    //     return this._cache;
    // }

    set value_sync(val: T) {
        if (this._cache === undefined) {
            console.warn('AutoDeviceStorage MISSING LOAD: Value has not been loaded', { key: this.key, value: val, cache: this._cache });
        }

        this._cache = val;
        Storage.setItem_noMemCache(this._propKey, JSON.stringify(val));
    }
}