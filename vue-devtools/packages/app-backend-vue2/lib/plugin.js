"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPlugin = void 0;
const devtools_api_1 = require("@vue/devtools-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const clone_deep_1 = __importDefault(require("clone-deep"));
let actionId = 0;
function setupPlugin(api, app, Vue) {
    const ROUTER_INSPECTOR_ID = 'vue2-router-inspector';
    const ROUTER_CHANGES_LAYER_ID = 'vue2-router-changes';
    const VUEX_INSPECTOR_ID = 'vue2-vuex-inspector';
    const VUEX_MUTATIONS_ID = 'vue2-vuex-mutations';
    const VUEX_ACTIONS_ID = 'vue2-vuex-actions';
    (0, devtools_api_1.setupDevtoolsPlugin)({
        app,
        id: 'org.vuejs.vue2-internal',
        label: 'Vue 2',
        homepage: 'https://vuejs.org/',
        logo: 'https://v2.vuejs.org/images/icons/favicon-96x96.png',
        settings: {
            legacyActions: {
                label: 'Legacy Actions',
                description: 'Enable this for Vuex < 3.1.0',
                type: 'boolean',
                defaultValue: false,
            },
        },
    }, api => {
        var _a;
        const hook = shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
        // Vue Router
        if (app.$router) {
            const router = app.$router;
            // Inspector
            api.addInspector({
                id: ROUTER_INSPECTOR_ID,
                label: 'Routes',
                icon: 'book',
                treeFilterPlaceholder: 'Search routes',
            });
            api.on.getInspectorTree(payload => {
                if (payload.inspectorId === ROUTER_INSPECTOR_ID) {
                    if (router.options.routes) {
                        payload.rootNodes = router.options.routes.map(route => formatRouteNode(router, route, '', payload.filter)).filter(Boolean);
                    }
                    else {
                        console.warn(`[Vue Devtools] No routes found in router`, router.options);
                    }
                }
            });
            api.on.getInspectorState(payload => {
                if (payload.inspectorId === ROUTER_INSPECTOR_ID) {
                    const route = router.matcher.getRoutes().find(r => getPathId(r) === payload.nodeId);
                    if (route) {
                        payload.state = {
                            options: formatRouteData(route),
                        };
                    }
                }
            });
            // Timeline
            api.addTimelineLayer({
                id: ROUTER_CHANGES_LAYER_ID,
                label: 'Router Navigations',
                color: 0x40a8c4,
            });
            router.afterEach((to, from) => {
                api.addTimelineEvent({
                    layerId: ROUTER_CHANGES_LAYER_ID,
                    event: {
                        time: api.now(),
                        title: to.path,
                        data: {
                            from,
                            to,
                        },
                    },
                });
                api.sendInspectorTree(ROUTER_INSPECTOR_ID);
            });
        }
        // Vuex
        if (app.$store) {
            const store = app.$store;
            api.addInspector({
                id: VUEX_INSPECTOR_ID,
                label: 'Vuex',
                icon: 'storage',
                treeFilterPlaceholder: 'Filter stores...',
            });
            api.on.getInspectorTree((payload) => {
                if (payload.inspectorId === VUEX_INSPECTOR_ID) {
                    if (payload.filter) {
                        const nodes = [];
                        flattenStoreForInspectorTree(nodes, store._modules.root, payload.filter, '');
                        payload.rootNodes = nodes;
                    }
                    else {
                        payload.rootNodes = [
                            formatStoreForInspectorTree(store._modules.root, 'Root', ''),
                        ];
                    }
                }
            });
            api.on.getInspectorState((payload) => {
                if (payload.inspectorId === VUEX_INSPECTOR_ID) {
                    const modulePath = payload.nodeId;
                    const module = getStoreModule(store._modules, modulePath);
                    // Access the getters prop to init getters cache (which is lazy)
                    // eslint-disable-next-line no-unused-expressions
                    module.context.getters;
                    payload.state = formatStoreForInspectorState(module, store._makeLocalGettersCache, modulePath);
                }
            });
            api.on.editInspectorState((payload) => {
                if (payload.inspectorId === VUEX_INSPECTOR_ID) {
                    let path = payload.path;
                    if (payload.nodeId !== VUEX_ROOT_PATH) {
                        path = [
                            ...payload.nodeId.split(VUEX_MODULE_PATH_SEPARATOR).slice(0, -1),
                            ...path,
                        ];
                    }
                    store._committing = true;
                    payload.set(store._vm.$data.$$state, path);
                    store._committing = false;
                }
            });
            api.addTimelineLayer({
                id: VUEX_MUTATIONS_ID,
                label: 'Vuex Mutations',
                color: LIME_500,
            });
            api.addTimelineLayer({
                id: VUEX_ACTIONS_ID,
                label: 'Vuex Actions',
                color: LIME_500,
            });
            hook.on('vuex:mutation', (mutation, state) => {
                api.sendInspectorState(VUEX_INSPECTOR_ID);
                const data = {};
                if (mutation.payload) {
                    data.payload = mutation.payload;
                }
                data.state = (0, clone_deep_1.default)(state);
                api.addTimelineEvent({
                    layerId: VUEX_MUTATIONS_ID,
                    event: {
                        time: api.now(),
                        title: mutation.type,
                        data,
                    },
                });
            });
            function legacySingleActionSub(action, state) {
                const data = {};
                if (action.payload) {
                    data.payload = action.payload;
                }
                data.state = state;
                api.addTimelineEvent({
                    layerId: VUEX_ACTIONS_ID,
                    event: {
                        time: api.now(),
                        title: action.type,
                        data,
                    },
                });
            }
            (_a = store.subscribeAction) === null || _a === void 0 ? void 0 : _a.call(store, api.getSettings().legacyActions
                ? legacySingleActionSub
                : {
                    before: (action, state) => {
                        const data = {};
                        if (action.payload) {
                            data.payload = action.payload;
                        }
                        action._id = actionId++;
                        action._time = api.now();
                        data.state = state;
                        api.addTimelineEvent({
                            layerId: VUEX_ACTIONS_ID,
                            event: {
                                time: action._time,
                                title: action.type,
                                groupId: action._id,
                                subtitle: 'start',
                                data,
                            },
                        });
                    },
                    after: (action, state) => {
                        const data = {};
                        const duration = api.now() - action._time;
                        data.duration = {
                            _custom: {
                                type: 'duration',
                                display: `${duration}ms`,
                                tooltip: 'Action duration',
                                value: duration,
                            },
                        };
                        if (action.payload) {
                            data.payload = action.payload;
                        }
                        data.state = state;
                        api.addTimelineEvent({
                            layerId: VUEX_ACTIONS_ID,
                            event: {
                                time: api.now(),
                                title: action.type,
                                groupId: action._id,
                                subtitle: 'end',
                                data,
                            },
                        });
                    },
                }, { prepend: true });
            // Inspect getters on mutations
            api.on.inspectTimelineEvent(payload => {
                if (payload.layerId === VUEX_MUTATIONS_ID) {
                    const getterKeys = Object.keys(store.getters);
                    if (getterKeys.length) {
                        const vm = new Vue({
                            data: {
                                $$state: payload.data.state,
                            },
                            computed: store._vm.$options.computed,
                        });
                        const originalVm = store._vm;
                        store._vm = vm;
                        const tree = transformPathsToObjectTree(store.getters);
                        payload.data.getters = (0, clone_deep_1.default)(tree);
                        store._vm = originalVm;
                        vm.$destroy();
                    }
                }
            });
        }
    });
}
exports.setupPlugin = setupPlugin;
/**
 * Extracted from tailwind palette
 */
const BLUE_600 = 0x2563eb;
const LIME_500 = 0x84cc16;
const CYAN_400 = 0x22d3ee;
const ORANGE_400 = 0xfb923c;
const WHITE = 0xffffff;
const DARK = 0x666666;
function formatRouteNode(router, route, parentPath, filter) {
    var _a, _b;
    const node = {
        id: route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`,
        label: route.path,
        children: (_a = route.children) === null || _a === void 0 ? void 0 : _a.map(child => formatRouteNode(router, child, route.path, filter)).filter(Boolean),
        tags: [],
    };
    if (filter && !node.id.includes(filter) && !((_b = node.children) === null || _b === void 0 ? void 0 : _b.length))
        return null;
    if (route.name != null) {
        node.tags.push({
            label: String(route.name),
            textColor: 0,
            backgroundColor: CYAN_400,
        });
    }
    if (route.alias != null) {
        node.tags.push({
            label: 'alias',
            textColor: 0,
            backgroundColor: ORANGE_400,
        });
    }
    if (node.id === router.currentRoute.path) {
        node.tags.push({
            label: 'active',
            textColor: WHITE,
            backgroundColor: BLUE_600,
        });
    }
    if (route.redirect) {
        node.tags.push({
            label: 'redirect: ' +
                (typeof route.redirect === 'string' ? route.redirect : 'Object'),
            textColor: WHITE,
            backgroundColor: DARK,
        });
    }
    return node;
}
function formatRouteData(route) {
    const data = [];
    data.push({ key: 'path', value: route.path });
    if (route.redirect) {
        data.push({ key: 'redirect', value: route.redirect });
    }
    if (route.alias) {
        data.push({ key: 'alias', value: route.alias });
    }
    if (route.props) {
        data.push({ key: 'props', value: route.props });
    }
    if (route.name && route.name != null) {
        data.push({ key: 'name', value: route.name });
    }
    if (route.component) {
        const component = {};
        // if (route.component.__file) {
        //   component.file = route.component.__file
        // }
        if (route.component.template) {
            component.template = route.component.template;
        }
        if (route.component.props) {
            component.props = route.component.props;
        }
        if (!(0, shared_utils_1.isEmptyObject)(component)) {
            data.push({ key: 'component', value: component });
        }
    }
    return data;
}
function getPathId(routeMatcher) {
    let path = routeMatcher.path;
    if (routeMatcher.parent) {
        path = getPathId(routeMatcher.parent) + path;
    }
    return path;
}
const TAG_NAMESPACED = {
    label: 'namespaced',
    textColor: WHITE,
    backgroundColor: DARK,
};
const VUEX_ROOT_PATH = '__vdt_root';
const VUEX_MODULE_PATH_SEPARATOR = '[vdt]';
const VUEX_MODULE_PATH_SEPARATOR_REG = /\[vdt\]/g;
function formatStoreForInspectorTree(module, moduleName, path) {
    var _a;
    return {
        id: path || VUEX_ROOT_PATH,
        // all modules end with a `/`, we want the last segment only
        // cart/ -> cart
        // nested/cart/ -> cart
        label: moduleName,
        tags: module.namespaced ? [TAG_NAMESPACED] : [],
        children: Object.keys((_a = module._children) !== null && _a !== void 0 ? _a : {}).map((key) => formatStoreForInspectorTree(module._children[key], key, `${path}${key}${VUEX_MODULE_PATH_SEPARATOR}`)),
    };
}
function flattenStoreForInspectorTree(result, module, filter, path) {
    if (path.includes(filter)) {
        result.push({
            id: path || VUEX_ROOT_PATH,
            label: path.endsWith(VUEX_MODULE_PATH_SEPARATOR) ? path.slice(0, path.length - 1) : path || 'Root',
            tags: module.namespaced ? [TAG_NAMESPACED] : [],
        });
    }
    Object.keys(module._children).forEach(moduleName => {
        flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + VUEX_MODULE_PATH_SEPARATOR);
    });
}
function extractNameFromPath(path) {
    return path && path !== VUEX_ROOT_PATH ? path.split(VUEX_MODULE_PATH_SEPARATOR).slice(-2, -1)[0] : 'Root';
}
function formatStoreForInspectorState(module, getters, path) {
    var _a, _b;
    const storeState = {
        state: Object.keys((_a = module.context.state) !== null && _a !== void 0 ? _a : {}).map((key) => ({
            key,
            editable: true,
            value: module.context.state[key],
        })),
    };
    if (getters) {
        const pathWithSlashes = path.replace(VUEX_MODULE_PATH_SEPARATOR_REG, '/');
        getters = !module.namespaced || path === VUEX_ROOT_PATH ? module.context.getters : getters[pathWithSlashes];
        let gettersKeys = Object.keys(getters);
        const shouldPickGetters = !module.namespaced && path !== VUEX_ROOT_PATH;
        if (shouldPickGetters) {
            // Only pick the getters defined in the non-namespaced module
            const definedGettersKeys = Object.keys((_b = module._rawModule.getters) !== null && _b !== void 0 ? _b : {});
            gettersKeys = gettersKeys.filter(key => definedGettersKeys.includes(key));
        }
        if (gettersKeys.length) {
            let moduleGetters;
            if (shouldPickGetters) {
                // Only pick the getters defined in the non-namespaced module
                moduleGetters = {};
                for (const key of gettersKeys) {
                    moduleGetters[key] = canThrow(() => getters[key]);
                }
            }
            else {
                moduleGetters = getters;
            }
            const tree = transformPathsToObjectTree(moduleGetters);
            storeState.getters = Object.keys(tree).map((key) => ({
                key: key.endsWith('/') ? extractNameFromPath(key) : key,
                editable: false,
                value: canThrow(() => tree[key]),
            }));
        }
    }
    return storeState;
}
function transformPathsToObjectTree(getters) {
    const result = {};
    Object.keys(getters).forEach(key => {
        const path = key.split('/');
        if (path.length > 1) {
            let target = result;
            const leafKey = path.pop();
            for (const p of path) {
                if (!target[p]) {
                    target[p] = {
                        _custom: {
                            value: {},
                            display: p,
                            tooltip: 'Module',
                            abstract: true,
                        },
                    };
                }
                target = target[p]._custom.value;
            }
            target[leafKey] = canThrow(() => getters[key]);
        }
        else {
            result[key] = canThrow(() => getters[key]);
        }
    });
    return result;
}
function getStoreModule(moduleMap, path) {
    const names = path.split(VUEX_MODULE_PATH_SEPARATOR).filter((n) => n);
    return names.reduce((module, moduleName, i) => {
        const child = module[moduleName === VUEX_ROOT_PATH ? 'root' : moduleName];
        if (!child) {
            throw new Error(`Missing module "${moduleName}" for path "${path}".`);
        }
        return i === names.length - 1 ? child : child._children;
    }, path === VUEX_ROOT_PATH ? moduleMap : moduleMap.root._children);
}
function canThrow(cb) {
    try {
        return cb();
    }
    catch (e) {
        return e;
    }
}
//# sourceMappingURL=plugin.js.map