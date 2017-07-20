import { constValue, constObject, fun } from './sample-module';

export function run() {
    return {
        v: constValue,
        o: constObject.a,
        f: fun(),
    };
}