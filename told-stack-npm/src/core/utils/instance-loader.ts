import { delay } from "./delay";

export class InstanceLoader<T> {
    private _isLoading = false;
    private _instance: T;
    private _resolves: ((value: T) => void)[] = [];

    constructor(private _load: () => Promise<T>) {

    }

    load() {
        return this._getInstance();
    }

    get instance() {
        return this._getInstance();
    }

    private _getInstance = () => {
        return new Promise<T>((resolve, reject) => {
            if (this._instance) { return resolve(this._instance); }

            if (this._isLoading) {
                return this._resolves.push(resolve);
            }
            this._isLoading = true;

            this._load().then(x => {
                this._instance = x;
                this._resolves.forEach(r => {
                    try {
                        r(x);
                    } catch (err) {
                        console.error('InstanceLoader: A resolver threw an uncaught error', { err });
                    }
                });

                this._resolves = null;
            });

        });
    }
}