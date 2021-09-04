"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueId = exports.getRenderKey = exports.getInstanceName = exports.isBeingDestroyed = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
function isBeingDestroyed(instance) {
    return instance._isBeingDestroyed;
}
exports.isBeingDestroyed = isBeingDestroyed;
/**
 * Get the appropriate display name for an instance.
 */
function getInstanceName(instance) {
    const name = shared_utils_1.getComponentName(instance.$options || instance.fnOptions || {});
    if (name)
        return name;
    return instance.$root === instance
        ? 'Root'
        : 'Anonymous Component';
}
exports.getInstanceName = getInstanceName;
function getRenderKey(value) {
    if (value == null)
        return;
    const type = typeof value;
    if (type === 'number') {
        return value.toString();
    }
    else if (type === 'string') {
        return `'${value}'`;
    }
    else if (Array.isArray(value)) {
        return 'Array';
    }
    else {
        return 'Object';
    }
}
exports.getRenderKey = getRenderKey;
/**
 * Returns a devtools unique id for instance.
 */
function getUniqueId(instance) {
    if (instance.__VUE_DEVTOOLS_UID__ != null)
        return instance.__VUE_DEVTOOLS_UID__;
    const rootVueId = instance.$root.__VUE_DEVTOOLS_ROOT_UID__;
    return `${rootVueId}:${instance._uid}`;
}
exports.getUniqueId = getUniqueId;
//# sourceMappingURL=util.js.map