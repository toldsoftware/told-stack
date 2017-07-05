import * as f from '../../data-pattern-lookup-lsc/src-server/function-03-update-execute-queue';
import { config } from "../config-lookup-lsc";

export const runFunction = (context: any) => f.runFunction(config, context);

export const functionBuildInfo = {
    functionName: 'lookup-lsc-03-update-execute-queue',
    functionJsonFile: JSON.stringify(f.createFunctionJson(config), null, ' '),
};

module.exports = runFunction;
