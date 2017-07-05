"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_function_1 = require("../core/build-function");
const lookup_lsc_01_http_1 = require("./_functions/lookup-lsc-01-http");
const lookup_lsc_02_update_request_queue_1 = require("./_functions/lookup-lsc-02-update-request-queue");
const lookup_lsc_03_update_execute_queue_1 = require("./_functions/lookup-lsc-03-update-execute-queue");
function runBuild() {
    return __awaiter(this, void 0, void 0, function* () {
        yield build_function_1.buildFunction({ destDir: '_deploy' }, [lookup_lsc_01_http_1.functionBuildInfo, lookup_lsc_02_update_request_queue_1.functionBuildInfo, lookup_lsc_03_update_execute_queue_1.functionBuildInfo]);
    });
}
exports.runBuild = runBuild;
runBuild();
//# sourceMappingURL=post-build.js.map