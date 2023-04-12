"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBackend = exports.availableBackends = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const app_backend_vue1_1 = require("@vue-devtools/app-backend-vue1");
const app_backend_vue2_1 = require("@vue-devtools/app-backend-vue2");
const app_backend_vue3_1 = require("@vue-devtools/app-backend-vue3");
const perf_1 = require("./perf");
exports.availableBackends = [
    app_backend_vue1_1.backend,
    app_backend_vue2_1.backend,
    app_backend_vue3_1.backend,
];
const enabledBackends = new Map();
function getBackend(backendOptions, ctx) {
    let backend;
    if (!enabledBackends.has(backendOptions)) {
        // Create backend
        backend = (0, app_backend_api_1.createBackend)(backendOptions, ctx);
        (0, perf_1.handleAddPerformanceTag)(backend, ctx);
        enabledBackends.set(backendOptions, backend);
        ctx.backends.push(backend);
    }
    else {
        backend = enabledBackends.get(backendOptions);
    }
    return backend;
}
exports.getBackend = getBackend;
//# sourceMappingURL=backend.js.map