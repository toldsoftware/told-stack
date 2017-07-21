
import { runFunction } from '@told/stack/src/core/tester/server/tester';
import { config } from '../../../config/src/tests/all-tests';

const run = function (...args: any[]) {
    runFunction.apply(null, [config, ...args]);
};

declare const global: any;
global.__run = run;
module.exports = global.__run;
