"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const f = require("../../data-pattern-lookup-lsc/src-server/function-01-http");
const config_1 = require("../config");
exports.runFunction = (context, req) => f.runFunction(config_1.config, context, req);
exports.functionBuildInfo = {
    functionName: 'lookup-lsc-01-http',
    functionJsonFile: JSON.stringify(f.createFunctionJson(config_1.config), null, ' '),
};
// module.exports = runFunction;
//# sourceMappingURL=lookup-lsc-01-http.js.map