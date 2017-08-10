
export function hashEmail_partial(email: string) {
    const name = email
        .substr(0, email.indexOf('@'))
        .replace(/\./g, '_')
        .replace(/[^a-zA-Z0-9]/g, '')
        ;

    const h = hash(email);

    return name + h;
}

export function hash(text: string): number {
    return text.split('').reduce((h, c) => {
        const code = c.charCodeAt(0);
        h = ((h << 5) - h) + code;
        return h | 0;
    }, 0);
}

export type Value = string | number | boolean;
export type ValueObject = { [key: string]: Value };

export function hashValue(h: number, v: Value) {
    if (typeof v === 'boolean') {
        return h = ((h << 5) - h) + (v ? 2 : 3);
    } else if (!v) {
        return h;
    } else if (typeof v === 'number') {
        if (v % 1 === 0) {
            return h = ((h << 5) - h) + v;
        } else {
            // For Floats, Convert to String
            return hash('' + v);
        }
    } else if (typeof v === 'string') {
        return hash(v);
    } else {
        return hash('' + v);
    }
}

export function hashValueObject(obj: ValueObject, h = 0) {
    for (let k in obj) {
        h = hashValue(h, obj[k]);
    }
    return h;
}

export function hashValueObjectArray(array: ValueObject[]) {
    let h = 0;
    for (let obj of array) {
        for (let k in obj) {
            h = hashValue(h, obj[k]);
        }
    }
    return h | 0;
}