import { perfNow } from "./perf-now";
import { stringifyPow, parsePow } from "./proof-of-work";

function runTests() {

    let totalElapsed_stringify = 0;
    let totalElapsed_parse = 0;
    let maxElapsed_stringify = 0;
    let maxElapsed_parse = 0;
    let maxElapsed_parse_obj = null as any;
    const count = 10;

    for (let i = 0; i < count; i++) {

        let testObj: any = {};
        const count = Math.random() * 10;

        for (let j = 0; j < count; j++) {
            testObj['' + (10000 * Math.random() | 0)] = 10000 * Math.random() | 0;
        }

        const start = perfNow();
        const jsonPow = stringifyPow(testObj, 'around10ms');
        const elapsed_stringify = perfNow() - start;

        const actual = parsePow(jsonPow, 'around10ms').data;
        const elapsed_parse = perfNow() - start - elapsed_stringify;

        if (JSON.stringify(actual) !== JSON.stringify(testObj)) {
            throw 'FAIL';
        }

        totalElapsed_stringify += elapsed_stringify;
        totalElapsed_parse += elapsed_parse;

        if (elapsed_stringify > maxElapsed_stringify) {
            maxElapsed_stringify = elapsed_stringify;
            maxElapsed_parse_obj = jsonPow;
        }

        maxElapsed_parse = Math.max(maxElapsed_parse, elapsed_parse);
    }

    const averageElapsed_stringify = totalElapsed_stringify / count;
    const averageElapsed_parse = totalElapsed_parse / count;

    const results = {
        totalElapsed_stringify,
        totalElapsed_parse,
    };
}

runTests();