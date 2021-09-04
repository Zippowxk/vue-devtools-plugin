"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapVueForEvents = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const internalRE = /^(?:pre-)?hook:/;
function wrap(app, Vue, method, ctx) {
    const original = Vue.prototype[method];
    if (original) {
        Vue.prototype[method] = function (...args) {
            const res = original.apply(this, args);
            logEvent(this, method, args[0], args.slice(1));
            return res;
        };
    }
    function logEvent(vm, type, eventName, payload) {
        // The string check is important for compat with 1.x where the first
        // argument may be an object instead of a string.
        // this also ensures the event is only logged for direct $emit (source)
        // instead of by $dispatch/$broadcast
        if (typeof eventName === 'string' && !internalRE.test(eventName)) {
            const instance = vm._self || vm;
            ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_EMIT, app, instance, eventName, payload);
        }
    }
}
function wrapVueForEvents(app, Vue, ctx) {
    ['$emit', '$broadcast', '$dispatch'].forEach(method => {
        wrap(app, Vue, method, ctx);
    });
}
exports.wrapVueForEvents = wrapVueForEvents;
//# sourceMappingURL=events.js.map