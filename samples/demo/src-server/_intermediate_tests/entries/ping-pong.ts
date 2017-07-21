
import { runFunction } from '@told/stack/src/tools/ping-pong/server/ping-pong';
import { config } from '../../../config/src/tools/ping-pong';

const run = function (...args: any[]) {
    runFunction.apply(null, [config, ...args]);
};

declare const global: any;
global.__run = run;
module.exports = global.__run;
