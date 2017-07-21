const ids: any[] = [];
const CANCEL = -1;

export function setInterval_exponentialBackoff(callback: () => void | Promise<void>, timeMs = 1000, options?: {
    maxAttempts?: number,
    base?: number,
    maxTime?: number,
    failCallback?: (err: any) => void,
}): number {

    options = options || {};
    const maxTime = options.maxTime;
    const maxAttempts = options.maxAttempts || (!maxTime ? 5 : undefined);
    const base = options.base || 2;

    const id = ids.length;
    ids.push(0);

    let attempt = -1;

    const call = async () => {
        try {
            await callback();
        } catch (err) {
            if (options.failCallback) {
                options.failCallback(err);
            }
        }

        if (ids[id] === CANCEL) { return; }

        attempt++;

        if (!maxAttempts || attempt < maxAttempts) {
            const backoffTime = timeMs * Math.pow(base, attempt);
            const actualTime = maxTime ? Math.min(maxTime, backoffTime) : backoffTime;
            // console.log('setInterval_exponentialBackoff', { actualTime, backoffTime, timeMs, maxTime, maxAttempts, base });

            ids[id] = setTimeout(() => {
                call();
            }, actualTime);
        } else {
            if (options.failCallback) {
                options.failCallback('TIMED OUT');
            }
        }
    };

    call();
    return id;
}

export function clearInterval_exponentialBackoff(id: number) {
    clearTimeout(ids[id]);
    ids[id] = CANCEL;
}


export function exponentialBackoff<T>(run: () => Promise<T>, isDone: (t: T) => boolean, timeMs = 1000, options?: {
    maxAttempts?: number,
    base?: number,
    maxTime?: number,
}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const failCallback = (err: any) => {
            reject(err);
        };

        const id = setInterval_exponentialBackoff(async () => {
            const r = await run();
            if (isDone(r)) {
                clearInterval_exponentialBackoff(id);
                resolve(r);
            }
        }, timeMs, { ...options, failCallback });
    });
}

export function maxTimeout<T>(maxTimeMs: number, run: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
        const id = setTimeout(() => {
            reject("TIMED OUT");
        }, maxTimeMs);

        run().then(t => {
            clearTimeout(id);
            resolve(t);
        }).catch((err) => {
            clearTimeout(id);
            reject(err);
        });
    });
}
