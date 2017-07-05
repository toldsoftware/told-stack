import * as f from '../../data-pattern-lookup-lsc/src-server/function-02-update-request-queue';
import { config } from "../config";

export const runFunction = (context: any) => f.runFunction(config, context);

export const functionBuildInfo = {
    functionName: 'lookup-lsc-02-update-request-queue',
    functionJsonFile: JSON.stringify(f.createFunctionJson(config), null, ' '),
};

module.exports = runFunction;
