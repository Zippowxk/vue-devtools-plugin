"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomInstanceDetails = exports.editState = exports.getInstanceDetails = void 0;
const util_1 = require("./util");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const shared_data_1 = __importDefault(require("@vue-devtools/shared-utils/lib/shared-data"));
const util_2 = require("../util");
/**
 * Get the detailed information of an inspected instance.
 */
function getInstanceDetails(instance, ctx) {
    var _a;
    return {
        id: util_1.getUniqueComponentId(instance, ctx),
        name: util_1.getInstanceName(instance),
        file: (_a = instance.type) === null || _a === void 0 ? void 0 : _a.__file,
        state: getInstanceState(instance)
    };
}
exports.getInstanceDetails = getInstanceDetails;
function getInstanceState(instance) {
    const mergedType = resolveMergedOptions(instance);
    return processProps(instance).concat(processState(instance), processSetupState(instance), processComputed(instance, mergedType), processAttrs(instance), processProvide(instance), processInject(instance, mergedType), processRefs(instance));
}
/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processProps(instance) {
    const propsData = [];
    const propDefinitions = instance.type.props;
    for (let key in instance.props) {
        const propDefinition = propDefinitions ? propDefinitions[key] : null;
        key = shared_utils_1.camelize(key);
        propsData.push({
            type: 'props',
            key,
            value: util_2.returnError(() => instance.props[key]),
            meta: propDefinition
                ? {
                    type: propDefinition.type ? getPropType(propDefinition.type) : 'any',
                    required: !!propDefinition.required,
                    ...propDefinition.default != null
                        ? {
                            default: propDefinition.default.toString()
                        }
                        : {}
                }
                : {
                    type: 'invalid'
                },
            editable: shared_data_1.default.editableProps
        });
    }
    return propsData;
}
const fnTypeRE = /^(?:function|class) (\w+)/;
/**
 * Convert prop type constructor to string.
 */
function getPropType(type) {
    if (Array.isArray(type)) {
        return type.map(t => getPropType(t)).join(' or ');
    }
    const match = type.toString().match(fnTypeRE);
    return typeof type === 'function'
        ? (match && match[1]) || 'any'
        : 'any';
}
/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processState(instance) {
    const type = instance.type;
    const props = type.props;
    const getters = type.vuex &&
        type.vuex.getters;
    const computedDefs = type.computed;
    const data = {
        ...instance.data,
        ...instance.renderContext
    };
    return Object.keys(data)
        .filter(key => (!(props && key in props) &&
        !(getters && key in getters) &&
        !(computedDefs && key in computedDefs)))
        .map(key => ({
        key,
        type: 'data',
        value: util_2.returnError(() => data[key]),
        editable: true
    }));
}
function processSetupState(instance) {
    const raw = instance.devtoolsRawSetupState || {};
    return Object.keys(instance.setupState)
        .map(key => {
        const value = util_2.returnError(() => instance.setupState[key]);
        const rawData = raw[key];
        let result;
        if (rawData) {
            const info = getSetupStateInfo(rawData);
            const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null;
            const isState = info.ref || info.computed || info.reactive;
            const isOther = typeof value === 'function' || typeof (value === null || value === void 0 ? void 0 : value.render) === 'function';
            result = {
                ...objectType ? { objectType } : {},
                ...raw.effect ? { raw: raw.effect.raw.toString() } : {},
                editable: isState && !info.readonly,
                type: isOther ? 'setup (other)' : 'setup'
            };
        }
        else {
            result = {
                type: 'setup'
            };
        }
        return {
            key,
            value,
            ...result
        };
    });
}
function isRef(raw) {
    return !!raw.__v_isRef;
}
function isComputed(raw) {
    return isRef(raw) && !!raw.effect;
}
function isReactive(raw) {
    return !!raw.__v_isReactive;
}
function isReadOnly(raw) {
    return !!raw.__v_isReadonly;
}
function getSetupStateInfo(raw) {
    return {
        ref: isRef(raw),
        computed: isComputed(raw),
        reactive: isReactive(raw),
        readonly: isReadOnly(raw)
    };
}
/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processComputed(instance, mergedType) {
    const type = mergedType;
    const computed = [];
    const defs = type.computed || {};
    // use for...in here because if 'computed' is not defined
    // on component, computed properties will be placed in prototype
    // and Object.keys does not include
    // properties from object's prototype
    for (const key in defs) {
        const def = defs[key];
        const type = typeof def === 'function' && def.vuex
            ? 'vuex bindings'
            : 'computed';
        computed.push({
            type,
            key,
            value: util_2.returnError(() => instance.proxy[key]),
            editable: typeof def.set === 'function'
        });
    }
    return computed;
}
function processAttrs(instance) {
    return Object.keys(instance.attrs)
        .map(key => ({
        type: 'attrs',
        key,
        value: util_2.returnError(() => instance.attrs[key])
    }));
}
function processProvide(instance) {
    return Object.keys(instance.provides)
        .map(key => ({
        type: 'provided',
        key,
        value: util_2.returnError(() => instance.provides[key])
    }));
}
function processInject(instance, mergedType) {
    if (!(mergedType === null || mergedType === void 0 ? void 0 : mergedType.inject))
        return [];
    let keys = [];
    if (Array.isArray(mergedType.inject)) {
        keys = mergedType.inject.map(key => ({
            key,
            originalKey: key
        }));
    }
    else {
        keys = Object.keys(mergedType.inject).map(key => {
            const value = mergedType.inject[key];
            let originalKey;
            if (typeof value === 'string') {
                originalKey = value;
            }
            else {
                originalKey = value.from;
            }
            return {
                key,
                originalKey
            };
        });
    }
    return keys.map(({ key, originalKey }) => ({
        type: 'injected',
        key: originalKey && key !== originalKey ? `${originalKey} ➞ ${key}` : key,
        value: util_2.returnError(() => instance.ctx[key])
    }));
}
function processRefs(instance) {
    return Object.keys(instance.refs)
        .map(key => ({
        type: 'refs',
        key,
        value: util_2.returnError(() => instance.refs[key])
    }));
}
function editState({ componentInstance, path, state, type }, ctx) {
    if (!['data', 'props', 'computed', 'setup'].includes(type))
        return;
    let target;
    const targetPath = path.slice();
    if (Object.keys(componentInstance.props).includes(path[0])) {
        // Props
        target = componentInstance.props;
    }
    else if (componentInstance.devtoolsRawSetupState && Object.keys(componentInstance.devtoolsRawSetupState).includes(path[0])) {
        // Setup
        target = componentInstance.devtoolsRawSetupState;
        const currentValue = shared_utils_1.get(componentInstance.devtoolsRawSetupState, path);
        if (currentValue != null) {
            const info = getSetupStateInfo(currentValue);
            if (info.readonly)
                return;
            if (info.ref) {
                targetPath.splice(1, 0, 'value');
            }
        }
    }
    else {
        target = componentInstance.proxy;
    }
    if (target && targetPath) {
        shared_utils_1.set(target, targetPath, 'value' in state ? state.value : undefined, (obj, field, value) => {
            if (state.remove || state.newKey) {
                if (Array.isArray(obj)) {
                    obj.splice(field, 1);
                }
                else {
                    delete obj[field];
                }
            }
            if (!state.remove) {
                obj[state.newKey || field] = value;
            }
        });
    }
}
exports.editState = editState;
function reduceStateList(list) {
    if (!list.length) {
        return undefined;
    }
    return list.reduce((map, item) => {
        const key = item.type || 'data';
        const obj = map[key] = map[key] || {};
        obj[item.key] = item.value;
        return map;
    }, {});
}
function getCustomInstanceDetails(instance) {
    if (instance._)
        instance = instance._;
    const state = getInstanceState(instance);
    return {
        _custom: {
            type: 'component',
            id: instance.__VUE_DEVTOOLS_UID__,
            display: util_1.getInstanceName(instance),
            tooltip: 'Component instance',
            value: reduceStateList(state),
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
function resolveMergedOptions(instance) {
    const raw = instance.type;
    const { mixins, extends: extendsOptions } = raw;
    const globalMixins = instance.appContext.mixins;
    if (!globalMixins.length && !mixins && !extendsOptions)
        return raw;
    const options = {};
    globalMixins.forEach(m => mergeOptions(options, m, instance));
    mergeOptions(options, raw, instance);
    return options;
}
function mergeOptions(to, from, instance) {
    if (!from)
        return to;
    if (typeof from === 'function') {
        from = from.options;
    }
    const { mixins, extends: extendsOptions } = from;
    extendsOptions && mergeOptions(to, extendsOptions, instance);
    mixins &&
        mixins.forEach((m) => mergeOptions(to, m, instance));
    for (const key of ['computed', 'inject']) {
        if (Object.prototype.hasOwnProperty.call(from, key)) {
            if (!to[key]) {
                to[key] = from[key];
            }
            else {
                Object.assign(to[key], from[key]);
            }
        }
    }
    return to;
}
//# sourceMappingURL=data.js.map