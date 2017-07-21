const ids: any[] = [];
const CANCEL = -1;

export function setInterval_exponentialBackoff(callback: () => void, timeMs = 1000, options?: {
    maxAttempts?: number,
    base?: number,
    maxTime?: number,
}): number {

    options = options || {};
    const maxTime = options.maxTime;
    const maxAttempts = options.maxAttempts || (!maxTime ? 5 : undefined);
    const base = options.base || 2;

    const id = ids.length;
    ids.push(0);

    let attempt = -1;

    const call = () => {
        callback();
        if (ids[id] === CANCEL) { return; }

        attempt++;

        if (!maxAttempts || attempt < maxAttempts) {
            const backoffTime = timeMs * Math.pow(base, attempt);
            const actualTime = maxTime ? Math.min(maxTime, backoffTime) : backoffTime;
            console.log('setInterval_exponentialBackoff', { actualTime, backoffTime, timeMs, maxTime, maxAttempts, base });

            ids[id] = setTimeout(() => {
                call();
            }, actualTime);
        }
    };

    call();
    return id;
}

export function clearInterval_exponentialBackoff(id: number) {
    clearTimeout(ids[id]);
    ids[id] = CANCEL;
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