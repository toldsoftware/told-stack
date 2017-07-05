import * as f from '../../data-pattern-lookup-lsc/src-server/function-01-http';
import { config } from "../config-lookup-lsc";

export const runFunction = (context: any, req: any) => f.runFunction(config, context, req);

export const functionBuildInfo = {
    functionName: 'lookup-lsc-01-http',
    functionJsonFile: JSON.stringify(f.createFunctionJson(config), null, ' '),
};

module.exports = runFunction;
