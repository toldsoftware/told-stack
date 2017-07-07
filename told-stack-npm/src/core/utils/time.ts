const ids: any[] = [];
const CANCEL = -1;

export function setInterval_exponentialBackoff(callback: () => void, timeMs = 1000, maxAttempts = 5, base = 2): number {
    const id = ids.length;
    ids.push(0);

    let attempt = 0;

    const call = () => {
        callback();
        if (ids[id] === CANCEL) { return; }

        attempt++;

        if (attempt < maxAttempts) {
            ids[id] = setTimeout(() => {
                call();
            }, timeMs * Math.pow(base, attempt));
        }
    };

    call();
    return id;
}

export function clearInterval_exponentialBackoff(id: number) {
    clearTimeout(ids[id]);
    ids[id] = CANCEL;
}