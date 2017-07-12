// Max Length 64
export function leftPad(v: number, length: number, character = '') {
    let p = '0000000000000000000000000000000000000000000000000000000000000000';
    if (character) {
        p = p.replace(/0/g, character);
    }
    return (p + v).substr(-length);
}