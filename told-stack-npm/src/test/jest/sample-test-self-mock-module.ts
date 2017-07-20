import { constValue, constObject, fun } from './sample-module-02';

export function run() {
    return {
        v: constValue,
        o: constObject.a,
        f: fun(),
    };
}