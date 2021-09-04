import { ComponentFilter } from './filter';
import { BackendContext } from '@vue-devtools/app-backend-api';
import { ComponentTreeNode } from '@vue/devtools-api';
export declare class ComponentWalker {
    ctx: BackendContext;
    maxDepth: number;
    componentFilter: ComponentFilter;
    captureIds: Map<string, undefined>;
    constructor(maxDepth: number, filter: string, ctx: BackendContext);
    getComponentTree(instance: any): Promise<ComponentTreeNode[]>;
    getComponentParents(instance: any): any[];
    /**
     * Find qualified children from a single instance.
     * If the instance itself is qualified, just return itself.
     * This is ok because [].concat works in both cases.
     *
     * @param {Vue|Vnode} instance
     * @return {Vue|Array}
     */
    private findQualifiedChildren;
    /**
     * Iterate through an array of instances and flatten it into
     * an array of qualified instances. This is a depth-first
     * traversal - e.g. if an instance is not matched, we will
     * recursively go deeper until a qualified child is found.
     *
     * @param {Array} instances
     * @return {Array}
     */
    private findQualifiedChildrenFromList;
    /**
     * Get children from a component instance.
     */
    private getInternalInstanceChildren;
    private captureId;
    /**
     * Capture the meta information of an instance. (recursive)
     *
     * @param {Vue} instance
     * @return {Object}
     */
    private capture;
    /**
     * Mark an instance as captured and store it in the instance map.
     *
     * @param {Vue} instance
     */
    private mark;
}
