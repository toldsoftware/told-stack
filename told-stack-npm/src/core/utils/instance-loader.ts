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

            this._resolves.push(resolve);

            if (this._isLoading) { return; }
            this._isLoading = true;

            console.log('InstanceLoader START');

            this._load().then(x => {
                console.log('InstanceLoader LOADED');

                this._instance = x;

                const resolves = this._resolves;
                this._resolves = null;

                resolves.forEach(r => {
                    setTimeout(() => {
                        try {
                            r(x);
                        } catch (err) {
                            console.error('InstanceLoader: A resolver threw an uncaught error', { err });
                        }
                    });
                });

                console.log('InstanceLoader DONE');
            });

        });
    }
}