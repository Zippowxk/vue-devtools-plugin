export declare class ComponentFilter {
    filter: string;
    constructor(filter: string);
    /**
     * Check if an instance is qualified.
     *
     * @param {Vue|Vnode} instance
     * @return {Boolean}
     */
    isQualified(instance: any): boolean;
}
