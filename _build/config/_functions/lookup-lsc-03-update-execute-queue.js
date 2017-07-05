"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const f = require("../../data-pattern-lookup-lsc/src-server/function-03-update-execute-queue");
const config_1 = require("../config");
exports.runFunction = (context) => f.runFunction(config_1.config, context);
exports.functionBuildInfo = {
    functionName: 'lookup-lsc-03-update-execute-queue',
    functionJsonFile: JSON.stringify(f.createFunctionJson(config_1.config), null, ' '),
};
module.exports = exports.runFunction;
//# sourceMappingURL=lookup-lsc-03-update-execute-queue.js.map