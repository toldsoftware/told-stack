const EXPIRE_TIME_MS = 60 * 1000;

interface ProofOfWorkJson {
    json: string;
    pow: string;
    now: string;
}

export function stringifyPow(data: any): string {
    const json = JSON.stringify(data);
    const now = Date.now();
    const pow = generatePow(json, now);
    const powObj = {
        json,
        pow,
        now: '' + now,
    };
    return JSON.stringify(powObj);
}

export function parsePow<T>(jsonPow: string): {
    data: T,
    data_ignoreVerificationError?: T,
    error?: string
} {
    try {
        const powObj = JSON.parse(jsonPow) as ProofOfWorkJson;
        const data = JSON.parse(powObj.json) as T;

        if (!verifyPow(powObj)) {
            return { data: null, data_ignoreVerificationError: data, error: 'Failed Proof of Work' };
        }

        if (!Object.getOwnPropertyNames(data).length) {
            return { data: null, data_ignoreVerificationError: data, error: 'No Data' };
        }

        return { data };
    } catch (err) {
        return { data: null, data_ignoreVerificationError: null, error: err };
    }
}

function generatePow(json: string, now: number): string {
    let pow = 0;
    const hashCode = fastHash(json);
    while (!isValidSolution(hashCode, pow, now)) {
        pow++;
    }
    return '' + pow;
}

function verifyPow({ json, pow, now }: ProofOfWorkJson) {
    // Check expiration
    if (Date.now() > 1 * (now as any) + EXPIRE_TIME_MS) {
        return false;
    }

    const hashCode = fastHash(json);
    return isValidSolution(hashCode, 1 * (pow as any), 1 * (now as any));
}

function isValidSolution(hashCode: number, pow: number, now: number) {
    // GOAL: Take around ~50ms

    // ~50ms
    return ((hashCode + pow) * 4241903 % 1974503) === ((pow + now) * 4241989 % 1974641);

    // ~100ms
    // return ((hashCode + pow) * 4241903 % 3093863) === ((pow + now) * 4241989 % 3093931);

    // ~200ms
    // return ((hashCode + pow) * 15485441 % 5385077) === ((pow + now) * 15485321 % 5384983);

    // ~ 2 Sec
    // return ((hashCode + pow) * 15485441 % 15484877) === ((pow + now) * 15485321 % 15484951);
}

function fastHash(text: string): number {
    return Math.abs(text.substr(0, 30).split('').reduce((hash, c) => {
        const code = c.charCodeAt(0);
        hash = ((hash << 5) - hash) + code;
        return hash | 0;
    }, text.length + 2671));
}
