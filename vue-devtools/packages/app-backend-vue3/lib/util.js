"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnError = exports.basename = exports.flatten = void 0;
const path_1 = __importDefault(require("path"));
function flatten(items) {
    return items.reduce((acc, item) => {
        if (item instanceof Array)
            acc.push(...flatten(item));
        else if (item)
            acc.push(item);
        return acc;
    }, []);
}
exports.flatten = flatten;
// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename(filename, ext) {
    return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}
exports.basename = basename;
function returnError(cb) {
    try {
        return cb();
    }
    catch (e) {
        return e;
    }
}
exports.returnError = returnError;
//# sourceMappingURL=util.js.map