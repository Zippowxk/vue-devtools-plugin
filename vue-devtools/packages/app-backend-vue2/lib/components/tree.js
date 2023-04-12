"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentParents = exports.walkTree = exports.functionalVnodeMap = exports.instanceMap = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const el_1 = require("./el");
const perf_js_1 = require("./perf.js");
const update_tracking_js_1 = require("./update-tracking.js");
const util_1 = require("./util");
let appRecord;
let api;
const consoleBoundInstances = Array(5);
let filter = '';
let recursively = false;
const functionalIds = new Map();
// Dedupe instances
// Some instances may be both on a component and on a child abstract/functional component
const captureIds = new Map();
async function walkTree(instance, pFilter, pRecursively, api, ctx) {
    initCtx(api, ctx);
    filter = pFilter;
    recursively = pRecursively;
    functionalIds.clear();
    captureIds.clear();
    const result = flatten(await findQualifiedChildren(instance));
    return result;
}
exports.walkTree = walkTree;
function getComponentParents(instance, api, ctx) {
    initCtx(api, ctx);
    const captureIds = new Map();
    const captureId = vm => {
        const id = vm.__VUE_DEVTOOLS_UID__ = (0, util_1.getUniqueId)(vm);
        if (captureIds.has(id))
            return;
        captureIds.set(id, undefined);
        if (vm.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
            markFunctional(id, vm.vnode);
        }
        else {
            mark(vm);
        }
    };
    const parents = [];
    captureId(instance);
    let parent = instance;
    while ((parent = parent.$parent)) {
        captureId(parent);
        parents.push(parent);
    }
    return parents;
}
exports.getComponentParents = getComponentParents;
function initCtx(_api, ctx) {
    appRecord = ctx.currentAppRecord;
    api = _api;
    if (!appRecord.meta) {
        appRecord.meta = {};
    }
    if (!appRecord.meta.instanceMap) {
        appRecord.meta.instanceMap = new Map();
    }
    exports.instanceMap = appRecord.meta.instanceMap;
    if (!appRecord.meta.functionalVnodeMap) {
        appRecord.meta.functionalVnodeMap = new Map();
    }
    exports.functionalVnodeMap = appRecord.meta.functionalVnodeMap;
}
/**
 * Iterate through an array of instances and flatten it into
 * an array of qualified instances. This is a depth-first
 * traversal - e.g. if an instance is not matched, we will
 * recursively go deeper until a qualified child is found.
 */
function findQualifiedChildrenFromList(instances) {
    instances = instances
        .filter(child => !(0, util_1.isBeingDestroyed)(child));
    return Promise.all(!filter
        ? instances.map(capture)
        : Array.prototype.concat.apply([], instances.map(findQualifiedChildren)));
}
/**
 * Find qualified children from a single instance.
 * If the instance itself is qualified, just return itself.
 * This is ok because [].concat works in both cases.
 */
async function findQualifiedChildren(instance) {
    if (isQualified(instance)) {
        return [await capture(instance)];
    }
    else {
        let children = await findQualifiedChildrenFromList(instance.$children);
        // Find functional components in recursively in non-functional vnodes.
        if (instance._vnode && instance._vnode.children) {
            const list = await Promise.all(flatten(instance._vnode.children.filter(child => !child.componentInstance).map(captureChild)));
            // Filter qualified children.
            const additionalChildren = list.filter(instance => isQualified(instance));
            children = children.concat(additionalChildren);
        }
        return children;
    }
}
/**
 * Get children from a component instance.
 */
function getInternalInstanceChildren(instance) {
    if (instance.$children) {
        return instance.$children;
    }
    return [];
}
/**
 * Check if an instance is qualified.
 */
function isQualified(instance) {
    const name = (0, util_1.getInstanceName)(instance);
    return (0, shared_utils_1.classify)(name).toLowerCase().indexOf(filter) > -1 ||
        (0, shared_utils_1.kebabize)(name).toLowerCase().indexOf(filter) > -1;
}
function flatten(items) {
    const r = items.reduce((acc, item) => {
        if (Array.isArray(item)) {
            let children = [];
            for (const i of item) {
                if (Array.isArray(i)) {
                    children = children.concat(flatten(i));
                }
                else {
                    children.push(i);
                }
            }
            acc.push(...children);
        }
        else if (item) {
            acc.push(item);
        }
        return acc;
    }, []);
    return r;
}
function captureChild(child) {
    if (child.fnContext && !child.componentInstance) {
        return capture(child);
    }
    else if (child.componentInstance) {
        if (!(0, util_1.isBeingDestroyed)(child.componentInstance))
            return capture(child.componentInstance);
    }
    else if (child.children) {
        return Promise.all(flatten(child.children.map(captureChild)));
    }
}
/**
 * Capture the meta information of an instance. (recursive)
 */
async function capture(instance, index, list) {
    var _a, _b, _c, _d, _e, _f;
    if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
        instance = instance.vnode;
    }
    if (instance.$options && instance.$options.abstract && instance._vnode && instance._vnode.componentInstance) {
        instance = instance._vnode.componentInstance;
    }
    if ((_b = (_a = instance.$options) === null || _a === void 0 ? void 0 : _a.devtools) === null || _b === void 0 ? void 0 : _b.hide)
        return;
    // Functional component.
    if (instance.fnContext && !instance.componentInstance) {
        const contextUid = instance.fnContext.__VUE_DEVTOOLS_UID__;
        let id = functionalIds.get(contextUid);
        if (id == null) {
            id = 0;
        }
        else {
            id++;
        }
        functionalIds.set(contextUid, id);
        const functionalId = contextUid + ':functional:' + id;
        markFunctional(functionalId, instance);
        const childrenPromise = (instance.children
            ? instance.children.map(child => child.fnContext
                ? captureChild(child)
                : child.componentInstance
                    ? capture(child.componentInstance)
                    : undefined)
            // router-view has both fnContext and componentInstance on vnode.
            : instance.componentInstance ? [capture(instance.componentInstance)] : []);
        // await all childrenCapture to-be resolved
        const children = (await Promise.all(childrenPromise)).filter(Boolean);
        const treeNode = {
            uid: functionalId,
            id: functionalId,
            tags: [
                {
                    label: 'functional',
                    textColor: 0x555555,
                    backgroundColor: 0xeeeeee,
                },
            ],
            name: (0, util_1.getInstanceName)(instance),
            renderKey: (0, util_1.getRenderKey)(instance.key),
            children,
            hasChildren: !!children.length,
            inactive: false,
            isFragment: false,
            autoOpen: recursively,
        };
        return api.visitComponentTree(instance, treeNode, filter, (_c = appRecord === null || appRecord === void 0 ? void 0 : appRecord.options) === null || _c === void 0 ? void 0 : _c.app);
    }
    // instance._uid is not reliable in devtools as there
    // may be 2 roots with same _uid which causes unexpected
    // behaviour
    instance.__VUE_DEVTOOLS_UID__ = (0, util_1.getUniqueId)(instance, appRecord);
    // Dedupe
    if (captureIds.has(instance.__VUE_DEVTOOLS_UID__)) {
        return;
    }
    else {
        captureIds.set(instance.__VUE_DEVTOOLS_UID__, undefined);
    }
    mark(instance);
    const name = (0, util_1.getInstanceName)(instance);
    const children = (await Promise.all((await getInternalInstanceChildren(instance))
        .filter(child => !(0, util_1.isBeingDestroyed)(child))
        .map(capture))).filter(Boolean);
    const ret = {
        uid: instance._uid,
        id: instance.__VUE_DEVTOOLS_UID__,
        name,
        renderKey: (0, util_1.getRenderKey)(instance.$vnode ? instance.$vnode.key : null),
        inactive: !!instance._inactive,
        isFragment: !!instance._isFragment,
        children,
        hasChildren: !!children.length,
        autoOpen: recursively,
        tags: [],
        meta: {},
    };
    if (instance._vnode && instance._vnode.children) {
        const vnodeChildren = await Promise.all(flatten(instance._vnode.children.map(captureChild)));
        ret.children = ret.children.concat(flatten(vnodeChildren).filter(Boolean));
        ret.hasChildren = !!ret.children.length;
    }
    // ensure correct ordering
    const rootElements = (0, el_1.getRootElementsFromComponentInstance)(instance);
    const firstElement = rootElements[0];
    if (firstElement === null || firstElement === void 0 ? void 0 : firstElement.parentElement) {
        const parentInstance = instance.$parent;
        const parentRootElements = parentInstance ? (0, el_1.getRootElementsFromComponentInstance)(parentInstance) : [];
        let el = firstElement;
        const indexList = [];
        do {
            indexList.push(Array.from(el.parentElement.childNodes).indexOf(el));
            el = el.parentElement;
        } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el));
        ret.domOrder = indexList.reverse();
    }
    else {
        ret.domOrder = [-1];
    }
    // check if instance is available in console
    const consoleId = consoleBoundInstances.indexOf(instance.__VUE_DEVTOOLS_UID__);
    ret.consoleId = consoleId > -1 ? '$vm' + consoleId : null;
    // check router view
    const isRouterView2 = (_e = (_d = instance.$vnode) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.routerView;
    if (instance._routerView || isRouterView2) {
        ret.isRouterView = true;
        if (!instance._inactive && instance.$route) {
            const matched = instance.$route.matched;
            const depth = isRouterView2
                ? instance.$vnode.data.routerViewDepth
                : instance._routerView.depth;
            ret.meta.matchedRouteSegment =
                matched &&
                    matched[depth] &&
                    (isRouterView2 ? matched[depth].path : matched[depth].handler.path);
        }
        ret.tags.push({
            label: `router-view${ret.meta.matchedRouteSegment ? `: ${ret.meta.matchedRouteSegment}` : ''}`,
            textColor: 0x000000,
            backgroundColor: 0xff8344,
        });
    }
    return api.visitComponentTree(instance, ret, filter, (_f = appRecord === null || appRecord === void 0 ? void 0 : appRecord.options) === null || _f === void 0 ? void 0 : _f.app);
}
/**
 * Mark an instance as captured and store it in the instance map.
 *
 * @param {Vue} instance
 */
function mark(instance) {
    const refId = instance.__VUE_DEVTOOLS_UID__;
    if (!exports.instanceMap.has(refId)) {
        exports.instanceMap.set(refId, instance);
        appRecord.instanceMap.set(refId, instance);
        instance.$on('hook:beforeDestroy', function () {
            exports.instanceMap.delete(refId);
        });
        (0, perf_js_1.applyPerfHooks)(api, instance, appRecord.options.app);
        (0, update_tracking_js_1.applyTrackingUpdateHook)(api, instance);
    }
}
function markFunctional(id, vnode) {
    const refId = vnode.fnContext.__VUE_DEVTOOLS_UID__;
    if (!exports.functionalVnodeMap.has(refId)) {
        exports.functionalVnodeMap.set(refId, {});
        vnode.fnContext.$on('hook:beforeDestroy', function () {
            exports.functionalVnodeMap.delete(refId);
        });
    }
    exports.functionalVnodeMap.get(refId)[id] = vnode;
    appRecord.instanceMap.set(id, {
        __VUE_DEVTOOLS_UID__: id,
        __VUE_DEVTOOLS_FUNCTIONAL_LEGACY__: true,
        vnode,
    });
}
//# sourceMappingURL=tree.js.map