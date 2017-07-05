"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_01_http_1 = require("../../data-pattern-lookup-lsc/src-server/function-01-http");
const config_1 = require("../config");
module.exports = function (...args) {
    function_01_http_1.runFunction.apply(null, [config_1.config, ...args]);
};
//# sourceMappingURL=_function-run.js.map