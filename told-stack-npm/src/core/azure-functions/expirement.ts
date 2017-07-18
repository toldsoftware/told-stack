type TMap<T> = {
    [P in keyof T]: string;
};

function t<T extends { [name: string]: string | number }>(obj: T): TMap<T> {
    return obj as any;
}

const a = { a: 123, b: 'abc' };
const b = t(a);

const looksLikeAStringNow = b.a.substr(0, 1);


// type AnySub = string | number;
// type MapSubType<T extends { [name: string]: { sub: AnySub } }> = {
//     [P in keyof T]: T[P];
// }

type OwnerType<T> = {
    sub: T;
};

function toSub<T>(s: OwnerType<T>): T {
    return s.sub;
}

// type SubMap<T extends OwnerType<string>> = {
//     [P in keyof T]: typeof T[P].sub;
// };

// function toSubProperties<T extends { [name: string]: OwnerType<string> }>(obj: T): TMap<T> {
//     return obj as any;
// }