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
// Queue Trigger: Update Request Queue
// Blob Out: Changing Blob
// Blob In-Out: Data Blob
// Blob Out: Lookup Blob
function createFunctionJson(config) {
    return {
        bindings: [
            {
                name: "inUpdateExecuteQueue",
                type: "queueTrigger",
                direction: "in",
                queueName: config.updateExecuteQueue_queueName
            },
            {
                name: "inoutRawDataBlob",
                type: "blob",
                direction: "inout",
                path: config.dataRawBlob_path_fromQueueTrigger
            },
            {
                name: "outChangingBlob",
                type: "blob",
                direction: "out",
                path: config.changingBlob_path_fromQueueTrigger
            },
        ],
        disabled: false
    };
}
exports.createFunctionJson = createFunctionJson;
function runFunction(config, context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.bindings.inoutRawDataBlob = yield config.obtainBlobData(context.bindings.inoutRawDataBlob, context.bindings.inUpdateExecuteQueue);
        context.bindings.outChangingBlob = null;
        context.done();
    });
}
exports.runFunction = runFunction;
//# sourceMappingURL=function-03-update-execute-queue.js.map