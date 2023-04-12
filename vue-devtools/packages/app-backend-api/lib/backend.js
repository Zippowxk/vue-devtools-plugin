"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackend = exports.defineBackend = exports.BuiltinBackendFeature = void 0;
const api_1 = require("./api");
var BuiltinBackendFeature;
(function (BuiltinBackendFeature) {
    /**
     * @deprecated
     */
    BuiltinBackendFeature["FLUSH"] = "flush";
})(BuiltinBackendFeature = exports.BuiltinBackendFeature || (exports.BuiltinBackendFeature = {}));
function defineBackend(options) {
    return options;
}
exports.defineBackend = defineBackend;
function createBackend(options, ctx) {
    const backend = {
        options,
        api: null,
    };
    backend.api = new api_1.DevtoolsApi(backend, ctx);
    options.setup(backend.api);
    return backend;
}
exports.createBackend = createBackend;
//# sourceMappingURL=backend.js.map