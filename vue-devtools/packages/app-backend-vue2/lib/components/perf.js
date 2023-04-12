"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPerfHooks = exports.initPerf = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const tree_1 = require("./tree");
const COMPONENT_HOOKS = {
    beforeCreate: { start: 'create' },
    created: { end: 'create' },
    beforeMount: { start: 'mount' },
    mounted: { end: 'mount' },
    beforeUpdate: { start: 'update' },
    updated: { end: 'update' },
    beforeDestroyed: { start: 'destroy' },
    destroyed: { end: 'destroy' },
};
function initPerf(api, app, Vue) {
    // Global mixin
    Vue.mixin({
        beforeCreate() {
            applyPerfHooks(api, this, app);
        },
    });
    // Apply to existing components
    tree_1.instanceMap === null || tree_1.instanceMap === void 0 ? void 0 : tree_1.instanceMap.forEach(vm => applyPerfHooks(api, vm, app));
}
exports.initPerf = initPerf;
function applyPerfHooks(api, vm, app) {
    if (vm.$options.$_devtoolsPerfHooks)
        return;
    vm.$options.$_devtoolsPerfHooks = true;
    for (const hook in COMPONENT_HOOKS) {
        const { start, end } = COMPONENT_HOOKS[hook];
        const handler = function () {
            if (shared_utils_1.SharedData.performanceMonitoringEnabled) {
                api.ctx.hook.emit(start ? shared_utils_1.HookEvents.PERFORMANCE_START : shared_utils_1.HookEvents.PERFORMANCE_END, app, this._uid, this, start !== null && start !== void 0 ? start : end, api.now());
            }
        };
        const currentValue = vm.$options[hook];
        if (Array.isArray(currentValue)) {
            vm.$options[hook] = [handler, ...currentValue];
        }
        else if (typeof currentValue === 'function') {
            vm.$options[hook] = [handler, currentValue];
        }
        else {
            vm.$options[hook] = [handler];
        }
    }
}
exports.applyPerfHooks = applyPerfHooks;
//# sourceMappingURL=perf.js.map