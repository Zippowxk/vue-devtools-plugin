"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editState = exports.findInstanceOrVnode = exports.getInstanceName = exports.reduceStateList = exports.getCustomInstanceDetails = exports.getInstanceDetails = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const shared_data_1 = __importDefault(require("@vue-devtools/shared-utils/lib/shared-data"));
const tree_1 = require("./tree");
/**
 * Get the detailed information of an inspected instance.
 */
function getInstanceDetails(instance) {
    var _a, _b;
    if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
        const vnode = findInstanceOrVnode(instance.__VUE_DEVTOOLS_UID__);
        if (!vnode)
            return null;
        const fakeInstance = {
            $options: vnode.fnOptions,
            ...((_a = vnode.devtoolsMeta) === null || _a === void 0 ? void 0 : _a.renderContext.props)
        };
        if (!fakeInstance.$options.props && ((_b = vnode.devtoolsMeta) === null || _b === void 0 ? void 0 : _b.renderContext.props)) {
            fakeInstance.$options.props = Object.keys(vnode.devtoolsMeta.renderContext.props).reduce((obj, key) => {
                obj[key] = {};
                return obj;
            }, {});
        }
        const data = {
            id: instance.__VUE_DEVTOOLS_UID__,
            name: shared_utils_1.getComponentName(vnode.fnOptions),
            file: instance.type ? instance.type.__file : vnode.fnOptions.__file || null,
            state: getFunctionalInstanceState(fakeInstance),
            functional: true
        };
        return data;
    }
    const data = {
        id: instance.__VUE_DEVTOOLS_UID__,
        name: getInstanceName(instance),
        state: getInstanceState(instance),
        file: null
    };
    let i;
    if ((i = instance.$vnode) && (i = i.componentOptions) && (i = i.Ctor) && (i = i.options)) {
        data.file = i.__file || null;
    }
    return data;
}
exports.getInstanceDetails = getInstanceDetails;
function getInstanceState(instance) {
    return processProps(instance).concat(processState(instance), processRefs(instance), processComputed(instance), processInjected(instance), processRouteContext(instance), processVuexGetters(instance), processFirebaseBindings(instance), processObservables(instance), processAttrs(instance));
}
function getFunctionalInstanceState(instance) {
    return processProps(instance);
}
function getCustomInstanceDetails(instance) {
    const state = getInstanceState(instance);
    return {
        _custom: {
            type: 'component',
            id: instance.__VUE_DEVTOOLS_UID__,
            display: getInstanceName(instance),
            tooltip: 'Component instance',
            value: reduceStateList(state),
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
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
exports.reduceStateList = reduceStateList;
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
/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 */
function processProps(instance) {
    const props = instance.$options.props;
    const propsData = [];
    for (let key in props) {
        const prop = props[key];
        key = shared_utils_1.camelize(key);
        propsData.push({
            type: 'props',
            key,
            value: instance[key],
            meta: prop
                ? {
                    type: prop.type ? getPropType(prop.type) : 'any',
                    required: !!prop.required
                }
                : {
                    type: 'invalid'
                },
            editable: shared_data_1.default.editableProps
        });
    }
    return propsData;
}
function processAttrs(instance) {
    return Object.entries(instance.$attrs || {}).map(([key, value]) => {
        return {
            type: '$attrs',
            key,
            value
        };
    });
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
 */
function processState(instance) {
    const props = instance.$options.props;
    const getters = instance.$options.vuex &&
        instance.$options.vuex.getters;
    return Object.keys(instance._data)
        .filter(key => (!(props && key in props) &&
        !(getters && key in getters)))
        .map(key => ({
        key,
        type: 'data',
        value: instance._data[key],
        editable: true
    }));
}
/**
 * Process refs
 */
function processRefs(instance) {
    return Object.keys(instance.$refs)
        .filter(key => instance.$refs[key])
        .map(key => shared_utils_1.getCustomRefDetails(instance, key, instance.$refs[key]));
}
/**
 * Process the computed properties of an instance.
 */
function processComputed(instance) {
    const computed = [];
    const defs = instance.$options.computed || {};
    // use for...in here because if 'computed' is not defined
    // on component, computed properties will be placed in prototype
    // and Object.keys does not include
    // properties from object's prototype
    for (const key in defs) {
        const def = defs[key];
        const type = typeof def === 'function' && def.vuex
            ? 'vuex bindings'
            : 'computed';
        // use try ... catch here because some computed properties may
        // throw error during its evaluation
        let computedProp = null;
        try {
            computedProp = {
                type,
                key,
                value: instance[key]
            };
        }
        catch (e) {
            computedProp = {
                type,
                key,
                value: e
            };
        }
        computed.push(computedProp);
    }
    return computed;
}
/**
 * Process Vuex getters.
 */
function processInjected(instance) {
    const injected = instance.$options.inject;
    if (injected) {
        return Object.keys(injected).map(key => {
            return {
                key,
                type: 'injected',
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
/**
 * Process possible vue-router $route context
 */
function processRouteContext(instance) {
    try {
        const route = instance.$route;
        if (route) {
            const { path, query, params } = route;
            const value = { path, query, params };
            if (route.fullPath)
                value.fullPath = route.fullPath;
            if (route.hash)
                value.hash = route.hash;
            if (route.name)
                value.name = route.name;
            if (route.meta)
                value.meta = route.meta;
            return [{
                    key: '$route',
                    type: 'route',
                    value: {
                        _custom: {
                            type: 'router',
                            abstract: true,
                            value
                        }
                    }
                }];
        }
    }
    catch (e) {
        // Invalid $router
    }
    return [];
}
/**
 * Process Vuex getters.
 */
function processVuexGetters(instance) {
    const getters = instance.$options.vuex &&
        instance.$options.vuex.getters;
    if (getters) {
        return Object.keys(getters).map(key => {
            return {
                type: 'vuex getters',
                key,
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
/**
 * Process Firebase bindings.
 */
function processFirebaseBindings(instance) {
    const refs = instance.$firebaseRefs;
    if (refs) {
        return Object.keys(refs).map(key => {
            return {
                type: 'firebase bindings',
                key,
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
/**
 * Process vue-rx observable bindings.
 */
function processObservables(instance) {
    const obs = instance.$observables;
    if (obs) {
        return Object.keys(obs).map(key => {
            return {
                type: 'observables',
                key,
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
function findInstanceOrVnode(id) {
    if (/:functional:/.test(id)) {
        const [refId] = id.split(':functional:');
        const map = tree_1.functionalVnodeMap.get(refId);
        return map && map[id];
    }
    return tree_1.instanceMap.get(id);
}
exports.findInstanceOrVnode = findInstanceOrVnode;
function editState({ componentInstance, path, state, type }) {
    if (!['data', 'props', 'computed', 'setup'].includes(type))
        return;
    const data = shared_utils_1.has(componentInstance._props, path, !!state.newKey)
        ? componentInstance._props
        : componentInstance._data;
    shared_utils_1.set(data, path, state.value, (obj, field, value) => {
        if (state.remove || state.newKey)
            componentInstance.$delete(obj, field);
        if (!state.remove)
            componentInstance.$set(obj, state.newKey || field, value);
    });
}
exports.editState = editState;
//# sourceMappingURL=data.js.map