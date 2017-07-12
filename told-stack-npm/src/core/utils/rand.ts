
// maxLength = 64
export function randHex(length = 8) {
    return '0000000000000000000000000000000000000000000000000000000000000000'
        .substr(0, length).replace(/0/g, () => (0 | Math.random() * 16).toString(16));
}