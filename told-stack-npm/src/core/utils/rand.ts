
// maxLength = 64
export function randHex(length = 8) {
    return '0000000000000000000000000000000000000000000000000000000000000000'
        .substr(0, length).replace(/0/g, () => (0 | Math.random() * 16).toString(16));
}

const words = 'axis ball camp deer ezra flag goat hand iowa jury kelp life mark nose oxen plan quiz rain ship tent user vest wolf yard zack'.toUpperCase();
const words_indexMax = Math.floor(words.length / 5);

export function randWord() {
    const i = 0 | words_indexMax * Math.random();
    return words.substr(i * 5, 4);
}