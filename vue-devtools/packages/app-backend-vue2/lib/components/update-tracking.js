"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTrackingUpdateHook = exports.initUpdateTracking = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const throttle_1 = __importDefault(require("lodash/throttle"));
const util_js_1 = require("./util.js");
function initUpdateTracking(api, Vue) {
    // Global mixin
    Vue.mixin({
        beforeCreate() {
            applyTrackingUpdateHook(api, this);
        },
    });
}
exports.initUpdateTracking = initUpdateTracking;
const COMPONENT_HOOKS = [
    'created',
    'updated',
];
function applyTrackingUpdateHook(api, vm) {
    if (vm.$options.$_devtoolsUpdateTrackingHooks)
        return;
    vm.$options.$_devtoolsUpdateTrackingHooks = true;
    const handler = (0, throttle_1.default)(async function () {
        if (shared_utils_1.SharedData.trackUpdates) {
            api.ctx.hook.emit(shared_utils_1.HookEvents.TRACK_UPDATE, (0, util_js_1.getUniqueId)(this), api.ctx);
            const parents = await api.walkComponentParents(this);
            for (const parent of parents) {
                api.ctx.hook.emit(shared_utils_1.HookEvents.TRACK_UPDATE, (0, util_js_1.getUniqueId)(parent), api.ctx);
            }
        }
        if (shared_utils_1.SharedData.flashUpdates) {
            api.ctx.hook.emit(shared_utils_1.HookEvents.FLASH_UPDATE, this, api.backend);
        }
    }, 100);
    for (const hook of COMPONENT_HOOKS) {
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
exports.applyTrackingUpdateHook = applyTrackingUpdateHook;
//# sourceMappingURL=update-tracking.js.map