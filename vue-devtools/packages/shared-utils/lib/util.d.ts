import { CustomState } from '@vue/devtools-api';
export declare const classify: (str: any) => any;
export declare const camelize: (str: any) => any;
export declare const kebabize: (str: any) => any;
export declare function getComponentDisplayName(originalName: any, style?: string): any;
export declare function inDoc(node: any): boolean;
/**
 * Stringify/parse data using CircularJSON.
 */
export declare const UNDEFINED = "__vue_devtool_undefined__";
export declare const INFINITY = "__vue_devtool_infinity__";
export declare const NEGATIVE_INFINITY = "__vue_devtool_negative_infinity__";
export declare const NAN = "__vue_devtool_nan__";
export declare const SPECIAL_TOKENS: {
    true: boolean;
    false: boolean;
    undefined: string;
    null: any;
    '-Infinity': string;
    Infinity: string;
    NaN: string;
};
export declare const MAX_STRING_SIZE = 10000;
export declare const MAX_ARRAY_SIZE = 5000;
export declare function specialTokenToString(value: any): false | "undefined" | "null" | "NaN" | "Infinity" | "-Infinity";
export declare function stringify(data: any): any;
export declare function getCustomMapDetails(val: any): {
    _custom: {
        type: string;
        display: string;
        value: any[];
        readOnly: boolean;
        fields: {
            abstract: boolean;
        };
    };
};
export declare function reviveMap(val: any): Map<any, any>;
export declare function getCustomSetDetails(val: any): {
    _custom: {
        type: string;
        display: string;
        value: unknown[];
        readOnly: boolean;
    };
};
export declare function reviveSet(val: any): Set<unknown>;
export declare function getComponentName(options: any): any;
export declare function getCustomComponentDefinitionDetails(def: any): {
    _custom: {
        file?: any;
        type: string;
        display: any;
        tooltip: string;
    };
};
export declare function getCustomFunctionDetails(func: Function): CustomState;
export declare function getCustomHTMLElementDetails(value: HTMLElement): CustomState;
export declare function getCustomRefDetails(instance: any, key: any, ref: any): {
    type: string;
    key: any;
    value: any;
    editable: boolean;
};
export declare function parse(data: any, revive?: boolean): any;
export declare function revive(val: any): any;
export declare function isPlainObject(obj: any): boolean;
/**
 * Searches a key or value in the object, with a maximum deepness
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
export declare function searchDeepInObject(obj: any, searchTerm: any): boolean;
export declare function sortByKey(state: any): any;
export declare function set(object: any, path: any, value: any, cb?: any): void;
export declare function get(object: any, path: any): any;
export declare function has(object: any, path: any, parent?: boolean): boolean;
export declare function focusInput(el: any): void;
export declare function openInEditor(file: any): void;
export declare function escape(s: any): any;
export declare function copyToClipboard(state: any): void;
export declare function isEmptyObject(obj: any): boolean;
