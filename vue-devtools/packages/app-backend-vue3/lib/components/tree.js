"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentWalker = void 0;
const util_1 = require("./util");
const filter_1 = require("./filter");
const el_1 = require("./el");
class ComponentWalker {
    constructor(maxDepth, filter, recursively, api, ctx) {
        this.ctx = ctx;
        this.api = api;
        this.maxDepth = maxDepth;
        this.recursively = recursively;
        this.componentFilter = new filter_1.ComponentFilter(filter);
    }
    getComponentTree(instance) {
        this.captureIds = new Map();
        return this.findQualifiedChildren(instance, 0);
    }
    getComponentParents(instance) {
        this.captureIds = new Map();
        const parents = [];
        this.captureId(instance);
        let parent = instance;
        while ((parent = parent.parent)) {
            this.captureId(parent);
            parents.push(parent);
        }
        return parents;
    }
    /**
     * Find qualified children from a single instance.
     * If the instance itself is qualified, just return itself.
     * This is ok because [].concat works in both cases.
     *
     * @param {Vue|Vnode} instance
     * @return {Vue|Array}
     */
    async findQualifiedChildren(instance, depth) {
        var _a;
        if (this.componentFilter.isQualified(instance) && !((_a = instance.type.devtools) === null || _a === void 0 ? void 0 : _a.hide)) {
            return [await this.capture(instance, null, depth)];
        }
        else if (instance.subTree) {
            // TODO functional components
            const list = this.isKeepAlive(instance)
                ? this.getKeepAliveCachedInstances(instance)
                : this.getInternalInstanceChildren(instance.subTree);
            return this.findQualifiedChildrenFromList(list, depth);
        }
        else {
            return [];
        }
    }
    /**
     * Iterate through an array of instances and flatten it into
     * an array of qualified instances. This is a depth-first
     * traversal - e.g. if an instance is not matched, we will
     * recursively go deeper until a qualified child is found.
     *
     * @param {Array} instances
     * @return {Array}
     */
    async findQualifiedChildrenFromList(instances, depth) {
        instances = instances
            .filter(child => { var _a; return !(0, util_1.isBeingDestroyed)(child) && !((_a = child.type.devtools) === null || _a === void 0 ? void 0 : _a.hide); });
        if (!this.componentFilter.filter) {
            return Promise.all(instances.map((child, index, list) => this.capture(child, list, depth)));
        }
        else {
            return Array.prototype.concat.apply([], await Promise.all(instances.map(i => this.findQualifiedChildren(i, depth))));
        }
    }
    /**
     * Get children from a component instance.
     */
    getInternalInstanceChildren(subTree, suspense = null) {
        const list = [];
        if (subTree) {
            if (subTree.component) {
                !suspense ? list.push(subTree.component) : list.push({ ...subTree.component, suspense });
            }
            else if (subTree.suspense) {
                const suspenseKey = !subTree.suspense.isInFallback ? 'suspense default' : 'suspense fallback';
                list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch, { ...subTree.suspense, suspenseKey }));
            }
            else if (Array.isArray(subTree.children)) {
                subTree.children.forEach(childSubTree => {
                    if (childSubTree.component) {
                        !suspense ? list.push(childSubTree.component) : list.push({ ...childSubTree.component, suspense });
                    }
                    else {
                        list.push(...this.getInternalInstanceChildren(childSubTree, suspense));
                    }
                });
            }
        }
        return list.filter(child => { var _a; return !(0, util_1.isBeingDestroyed)(child) && !((_a = child.type.devtools) === null || _a === void 0 ? void 0 : _a.hide); });
    }
    captureId(instance) {
        if (!instance)
            return null;
        // instance.uid is not reliable in devtools as there
        // may be 2 roots with same uid which causes unexpected
        // behaviour
        const id = instance.__VUE_DEVTOOLS_UID__ != null ? instance.__VUE_DEVTOOLS_UID__ : (0, util_1.getUniqueComponentId)(instance, this.ctx);
        instance.__VUE_DEVTOOLS_UID__ = id;
        // Dedupe
        if (this.captureIds.has(id)) {
            return;
        }
        else {
            this.captureIds.set(id, undefined);
        }
        this.mark(instance);
        return id;
    }
    /**
     * Capture the meta information of an instance. (recursive)
     *
     * @param {Vue} instance
     * @return {Object}
     */
    async capture(instance, list, depth) {
        var _a;
        if (!instance)
            return null;
        const id = this.captureId(instance);
        const name = (0, util_1.getInstanceName)(instance);
        const children = this.getInternalInstanceChildren(instance.subTree)
            .filter(child => !(0, util_1.isBeingDestroyed)(child));
        const parents = this.getComponentParents(instance) || [];
        const inactive = !!instance.isDeactivated || parents.some(parent => parent.isDeactivated);
        const treeNode = {
            uid: instance.uid,
            id,
            name,
            renderKey: (0, util_1.getRenderKey)(instance.vnode ? instance.vnode.key : null),
            inactive,
            hasChildren: !!children.length,
            children: [],
            isFragment: (0, util_1.isFragment)(instance),
            tags: typeof instance.type !== 'function'
                ? []
                : [
                    {
                        label: 'functional',
                        textColor: 0x555555,
                        backgroundColor: 0xeeeeee,
                    },
                ],
            autoOpen: this.recursively,
        };
        // capture children
        if (depth < this.maxDepth || instance.type.__isKeepAlive || parents.some(parent => parent.type.__isKeepAlive)) {
            treeNode.children = await Promise.all(children
                .map((child, index, list) => this.capture(child, list, depth + 1))
                .filter(Boolean));
        }
        // keep-alive
        if (this.isKeepAlive(instance)) {
            const cachedComponents = this.getKeepAliveCachedInstances(instance);
            const childrenIds = children.map(child => child.__VUE_DEVTOOLS_UID__);
            for (const cachedChild of cachedComponents) {
                if (!childrenIds.includes(cachedChild.__VUE_DEVTOOLS_UID__)) {
                    const node = await this.capture({ ...cachedChild, isDeactivated: true }, null, depth + 1);
                    if (node) {
                        treeNode.children.push(node);
                    }
                }
            }
        }
        // ensure correct ordering
        const rootElements = (0, el_1.getRootElementsFromComponentInstance)(instance);
        const firstElement = rootElements[0];
        if (firstElement === null || firstElement === void 0 ? void 0 : firstElement.parentElement) {
            const parentInstance = instance.parent;
            const parentRootElements = parentInstance ? (0, el_1.getRootElementsFromComponentInstance)(parentInstance) : [];
            let el = firstElement;
            const indexList = [];
            do {
                indexList.push(Array.from(el.parentElement.childNodes).indexOf(el));
                el = el.parentElement;
            } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el));
            treeNode.domOrder = indexList.reverse();
        }
        else {
            treeNode.domOrder = [-1];
        }
        if ((_a = instance.suspense) === null || _a === void 0 ? void 0 : _a.suspenseKey) {
            treeNode.tags.push({
                label: instance.suspense.suspenseKey,
                backgroundColor: 0xe492e4,
                textColor: 0xffffff,
            });
            // update instanceMap
            this.mark(instance, true);
        }
        return this.api.visitComponentTree(instance, treeNode, this.componentFilter.filter, this.ctx.currentAppRecord.options.app);
    }
    /**
     * Mark an instance as captured and store it in the instance map.
     *
     * @param {Vue} instance
     */
    mark(instance, force = false) {
        const instanceMap = this.ctx.currentAppRecord.instanceMap;
        if (force || !instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
            instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance);
        }
    }
    isKeepAlive(instance) {
        return instance.type.__isKeepAlive && instance.__v_cache;
    }
    getKeepAliveCachedInstances(instance) {
        return Array.from(instance.__v_cache.values()).map((vnode) => vnode.component).filter(Boolean);
    }
}
exports.ComponentWalker = ComponentWalker;
//# sourceMappingURL=tree.js.map