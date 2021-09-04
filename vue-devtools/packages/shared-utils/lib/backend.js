"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatchedGetters = exports.getCustomStoreDetails = exports.getCustomRouterDetails = exports.isVueInstance = exports.getCustomInstanceDetails = exports.getInstanceMap = exports.backendInjections = void 0;
exports.backendInjections = {
    instanceMap: new Map(),
    isVueInstance: (() => false),
    getCustomInstanceDetails: (() => ({}))
};
function getInstanceMap() {
    return exports.backendInjections.instanceMap;
}
exports.getInstanceMap = getInstanceMap;
function getCustomInstanceDetails(instance) {
    return exports.backendInjections.getCustomInstanceDetails(instance);
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
function isVueInstance(value) {
    return exports.backendInjections.isVueInstance(value);
}
exports.isVueInstance = isVueInstance;
// @TODO refactor
function getCustomRouterDetails(router) {
    return {
        _custom: {
            type: 'router',
            display: 'VueRouter',
            value: {
                options: router.options,
                currentRoute: router.currentRoute
            },
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomRouterDetails = getCustomRouterDetails;
// @TODO refactor
function getCustomStoreDetails(store) {
    return {
        _custom: {
            type: 'store',
            display: 'Store',
            value: {
                state: store.state,
                getters: getCatchedGetters(store)
            },
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomStoreDetails = getCustomStoreDetails;
// @TODO refactor
function getCatchedGetters(store) {
    const getters = {};
    const origGetters = store.getters || {};
    const keys = Object.keys(origGetters);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        Object.defineProperty(getters, key, {
            enumerable: true,
            get: () => {
                try {
                    return origGetters[key];
                }
                catch (e) {
                    return e;
                }
            }
        });
    }
    return getters;
}
exports.getCatchedGetters = getCatchedGetters;
//# sourceMappingURL=backend.js.map