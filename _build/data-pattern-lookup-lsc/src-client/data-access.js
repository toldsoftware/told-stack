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
const node_fetch_1 = require("node-fetch");
class DataAccess {
    constructor(config) {
        this.config = config;
    }
    read(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return readAppBlob(this.config, key);
        });
    }
    readAndUpdate(key, notifyUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            return readAppBlobAndUpdate(this.config, key, notifyUpdate);
        });
    }
}
exports.DataAccess = DataAccess;
function readAppBlob(config, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield readAppBlob_inner(config, key);
        return data;
    });
}
exports.readAppBlob = readAppBlob;
function readAppBlob_inner(config, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const rLookup = yield node_fetch_1.default(config.getLookupUrl(key));
        const lookup = yield rLookup.text();
        const r = yield node_fetch_1.default(config.getDataDownloadUrl(key, lookup));
        const data = yield r.json();
        return { data, lookup };
    });
}
exports.readAppBlob_inner = readAppBlob_inner;
function readAppBlobAndUpdate(config, key, notifyUpdate) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, lookup } = yield readAppBlob_inner(config, key);
        if (notifyUpdate) {
            let intervalCount = 0;
            const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                intervalCount++;
                if (intervalCount > config.maxPollCount) {
                    clearInterval(intervalId);
                }
                const rLookup_update = yield node_fetch_1.default(config.getLookupUrl(key));
                const lName_update = yield rLookup_update.text();
                if (lName_update !== lookup) {
                    clearInterval(intervalId);
                    notifyUpdate();
                }
            }), config.timePollSeconds * 1000);
        }
        return data;
    });
}
exports.readAppBlobAndUpdate = readAppBlobAndUpdate;
//# sourceMappingURL=data-access.js.map