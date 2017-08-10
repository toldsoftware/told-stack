const EXPIRE_TIME_MS = 60 * 1000;

const isValidSolution_versions = {
    around10ms: (hashCode: number, pow: number, now: number) => ((hashCode + pow) * 100003 % 99233) === ((pow + now) * 100361 % 99241),
    around50ms: (hashCode: number, pow: number, now: number) => ((hashCode + pow) * 4241903 % 1974503) === ((pow + now) * 4241989 % 1974641),
    around100ms: (hashCode: number, pow: number, now: number) => ((hashCode + pow) * 4241903 % 3093863) === ((pow + now) * 4241989 % 3093931),
    around200ms: (hashCode: number, pow: number, now: number) => ((hashCode + pow) * 15485441 % 5385077) === ((pow + now) * 15485321 % 5384983),
    around2000ms: (hashCode: number, pow: number, now: number) => ((hashCode + pow) * 15485441 % 15484877) === ((pow + now) * 15485321 % 15484951),
}

type IsValidSolution = (hashCode: number, pow: number, now: number) => boolean;
type PowVersion = keyof typeof isValidSolution_versions;

interface ProofOfWorkJson {
    json: string;
    pow: string;
    now: string;
}

export function stringifyPow(data: any, version: PowVersion = 'around10ms'): string {
    const isValidSolution = isValidSolution_versions[version];

    const json = JSON.stringify(data);
    const now = Date.now();
    const pow = generatePow(isValidSolution, json, now);
    const powObj = {
        json,
        pow,
        now: '' + now,
    };
    return JSON.stringify(powObj);
}

export function parsePow<T>(jsonPow: string, version: PowVersion = 'around10ms'): {
    data: T,
    data_ignoreVerificationError?: T,
    error?: string
} {
    const isValidSolution = isValidSolution_versions[version];

    try {
        const powObj = JSON.parse(jsonPow) as ProofOfWorkJson;
        const data = JSON.parse(powObj.json) as T;

        if (!verifyPow(isValidSolution, powObj)) {
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

function generatePow(isValidSolution: IsValidSolution, json: string, now: number): string {
    let pow = 0;
    const hashCode = fastHash(json);
    while (!isValidSolution(hashCode, pow, now)) {
        pow++;
    }
    return '' + pow;
}

function verifyPow(isValidSolution: IsValidSolution, { json, pow, now }: ProofOfWorkJson) {
    // Check expiration
    if (Date.now() > 1 * (now as any) + EXPIRE_TIME_MS) {
        return false;
    }

    // Check pow is within range
    const powNum = 1 * (pow as any);
    if (powNum < 1 || powNum > 1E9) {
        return false;
    }

    const hashCode = fastHash(json);
    return isValidSolution(hashCode, powNum, 1 * (now as any));
}

function fastHash(text: string): number {
    return Math.abs(text.substr(0, 30).split('').reduce((hash, c) => {
        const code = c.charCodeAt(0);
        hash = ((hash << 5) - hash) + code;
        return hash | 0;
    }, text.length + 2671));
}
