"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentInstances = exports.getRenderKey = exports.getUniqueComponentId = exports.getInstanceName = exports.isFragment = exports.getAppRecord = exports.isBeingDestroyed = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const util_1 = require("../util");
function isBeingDestroyed(instance) {
    return instance._isBeingDestroyed || instance.isUnmounted;
}
exports.isBeingDestroyed = isBeingDestroyed;
function getAppRecord(instance) {
    if (instance.root) {
        return instance.appContext.app.__VUE_DEVTOOLS_APP_RECORD__;
    }
}
exports.getAppRecord = getAppRecord;
function isFragment(instance) {
    const appRecord = getAppRecord(instance);
    if (appRecord) {
        return appRecord.options.types.Fragment === instance.subTree.type;
    }
}
exports.isFragment = isFragment;
/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
function getInstanceName(instance) {
    var _a, _b, _c;
    const name = getComponentTypeName(instance.type || {});
    if (name)
        return name;
    if (instance.root === instance)
        return 'Root';
    for (const key in (_b = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.components) {
        if (instance.parent.type.components[key] === instance.type)
            return saveComponentName(instance, key);
    }
    for (const key in (_c = instance.appContext) === null || _c === void 0 ? void 0 : _c.components) {
        if (instance.appContext.components[key] === instance.type)
            return saveComponentName(instance, key);
    }
    return 'Anonymous Component';
}
exports.getInstanceName = getInstanceName;
function saveComponentName(instance, key) {
    instance.type.__vdevtools_guessedName = key;
    return key;
}
function getComponentTypeName(options) {
    const name = options.name || options._componentTag || options.__vdevtools_guessedName;
    if (name) {
        return name;
    }
    const file = options.__file; // injected by vue-loader
    if (file) {
        return shared_utils_1.classify(util_1.basename(file, '.vue'));
    }
}
/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
function getUniqueComponentId(instance, ctx) {
    const instanceId = instance === ctx.currentAppRecord.rootInstance ? 'root' : instance.uid;
    return `${ctx.currentAppRecord.id}:${instanceId}`;
}
exports.getUniqueComponentId = getUniqueComponentId;
function getRenderKey(value) {
    if (value == null)
        return;
    const type = typeof value;
    if (type === 'number') {
        return value;
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
function getComponentInstances(app) {
    const appRecord = app.__VUE_DEVTOOLS_APP_RECORD__;
    const appId = appRecord.id.toString();
    return [...appRecord.instanceMap]
        .filter(([key]) => key.split(':')[0] === appId)
        .map(([, instance]) => instance); // eslint-disable-line comma-spacing
}
exports.getComponentInstances = getComponentInstances;
//# sourceMappingURL=util.js.map