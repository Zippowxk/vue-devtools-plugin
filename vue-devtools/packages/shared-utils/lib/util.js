"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(window,'process',{
    get(){
      return {platform:'browers'}
    },
    configurable: false
})
exports.isEmptyObject = exports.copyToClipboard = exports.escape = exports.openInEditor = exports.focusInput = exports.simpleGet = exports.sortByKey = exports.searchDeepInObject = exports.isPlainObject = exports.revive = exports.parse = exports.getCustomRefDetails = exports.getCustomHTMLElementDetails = exports.getCustomFunctionDetails = exports.getCustomComponentDefinitionDetails = exports.getComponentName = exports.reviveSet = exports.getCustomSetDetails = exports.reviveMap = exports.getCustomMapDetails = exports.stringify = exports.specialTokenToString = exports.MAX_ARRAY_SIZE = exports.MAX_STRING_SIZE = exports.SPECIAL_TOKENS = exports.NAN = exports.NEGATIVE_INFINITY = exports.INFINITY = exports.UNDEFINED = exports.inDoc = exports.getComponentDisplayName = exports.kebabize = exports.camelize = exports.classify = void 0;
const path_1 = __importDefault(require("path"));
const transfer_1 = require("./transfer");
const backend_1 = require("./backend");
const shared_data_1 = require("./shared-data");
const env_1 = require("./env");


function cached(fn) {
    const cache = Object.create(null);
    return function cachedFn(str) {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}
const classifyRE = /(?:^|[-_/])(\w)/g;
exports.classify = cached((str) => {
    // fix: str.replace may causes '"replace" is not a function' exception.
    // This bug may causes the UI 'Component Filter' to not work properly
    // e.g. The type of 'str' is Number.
    // So need cover 'str' to String.
    return str && ('' + str).replace(classifyRE, toUpper);
});
const camelizeRE = /-(\w)/g;
exports.camelize = cached((str) => {
    return str && str.replace(camelizeRE, toUpper);
});
const kebabizeRE = /([a-z0-9])([A-Z])/g;
exports.kebabize = cached((str) => {
    return str && str
        .replace(kebabizeRE, (_, lowerCaseCharacter, upperCaseLetter) => {
        return `${lowerCaseCharacter}-${upperCaseLetter}`;
    })
        .toLowerCase();
});
function toUpper(_, c) {
    return c ? c.toUpperCase() : '';
}
function getComponentDisplayName(originalName, style = 'class') {
    switch (style) {
        case 'class':
            return (0, exports.classify)(originalName);
        case 'kebab':
            return (0, exports.kebabize)(originalName);
        case 'original':
        default:
            return originalName;
    }
}
exports.getComponentDisplayName = getComponentDisplayName;
function inDoc(node) {
    if (!node)
        return false;
    const doc = node.ownerDocument.documentElement;
    const parent = node.parentNode;
    return doc === node ||
        doc === parent ||
        !!(parent && parent.nodeType === 1 && (doc.contains(parent)));
}
exports.inDoc = inDoc;
/**
 * Stringify/parse data using CircularJSON.
 */
exports.UNDEFINED = '__vue_devtool_undefined__';
exports.INFINITY = '__vue_devtool_infinity__';
exports.NEGATIVE_INFINITY = '__vue_devtool_negative_infinity__';
exports.NAN = '__vue_devtool_nan__';
exports.SPECIAL_TOKENS = {
    true: true,
    false: false,
    undefined: exports.UNDEFINED,
    null: null,
    '-Infinity': exports.NEGATIVE_INFINITY,
    Infinity: exports.INFINITY,
    NaN: exports.NAN,
};
exports.MAX_STRING_SIZE = 10000;
exports.MAX_ARRAY_SIZE = 5000;
function specialTokenToString(value) {
    if (value === null) {
        return 'null';
    }
    else if (value === exports.UNDEFINED) {
        return 'undefined';
    }
    else if (value === exports.NAN) {
        return 'NaN';
    }
    else if (value === exports.INFINITY) {
        return 'Infinity';
    }
    else if (value === exports.NEGATIVE_INFINITY) {
        return '-Infinity';
    }
    return false;
}
exports.specialTokenToString = specialTokenToString;
/**
 * Needed to prevent stack overflow
 * while replacing complex objects
 * like components because we create
 * new objects with the CustomValue API
 * (.i.e `{ _custom: { ... } }`)
 */
class EncodeCache {
    constructor() {
        this.map = new Map();
    }
    /**
     * Returns a result unique to each input data
     * @param {*} data Input data
     * @param {*} factory Function used to create the unique result
     */
    cache(data, factory) {
        const cached = this.map.get(data);
        if (cached) {
            return cached;
        }
        else {
            const result = factory(data);
            this.map.set(data, result);
            return result;
        }
    }
    clear() {
        this.map.clear();
    }
}
const encodeCache = new EncodeCache();
class ReviveCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.map = new Map();
        this.index = 0;
        this.size = 0;
    }
    cache(value) {
        const currentIndex = this.index;
        this.map.set(currentIndex, value);
        this.size++;
        if (this.size > this.maxSize) {
            this.map.delete(currentIndex - this.size);
            this.size--;
        }
        this.index++;
        return currentIndex;
    }
    read(id) {
        return this.map.get(id);
    }
}
const reviveCache = new ReviveCache(1000);
const replacers = {
    internal: replacerForInternal,
    user: replaceForUser,
};
function stringify(data, target = 'internal') {
    // Create a fresh cache for each serialization
    encodeCache.clear();
    return (0, transfer_1.stringifyCircularAutoChunks)(data, replacers[target]);
}
exports.stringify = stringify;
function replacerForInternal(key) {
    var _a;
    // @ts-ignore
    const val = this[key];
    const type = typeof val;
    if (Array.isArray(val)) {
        const l = val.length;
        if (l > exports.MAX_ARRAY_SIZE) {
            return {
                _isArray: true,
                length: l,
                items: val.slice(0, exports.MAX_ARRAY_SIZE),
            };
        }
        return val;
    }
    else if (typeof val === 'string') {
        if (val.length > exports.MAX_STRING_SIZE) {
            return val.substring(0, exports.MAX_STRING_SIZE) + `... (${(val.length)} total length)`;
        }
        else {
            return val;
        }
    }
    else if (type === 'undefined') {
        return exports.UNDEFINED;
    }
    else if (val === Infinity) {
        return exports.INFINITY;
    }
    else if (val === -Infinity) {
        return exports.NEGATIVE_INFINITY;
    }
    else if (type === 'function') {
        return getCustomFunctionDetails(val);
    }
    else if (type === 'symbol') {
        return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
    }
    else if (val !== null && type === 'object') {
        const proto = Object.prototype.toString.call(val);
        if (proto === '[object Map]') {
            return encodeCache.cache(val, () => getCustomMapDetails(val));
        }
        else if (proto === '[object Set]') {
            return encodeCache.cache(val, () => getCustomSetDetails(val));
        }
        else if (proto === '[object RegExp]') {
            // special handling of native type
            return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
        }
        else if (proto === '[object Date]') {
            return `[native Date ${Date.prototype.toString.call(val)}]`;
        }
        else if (proto === '[object Error]') {
            return `[native Error ${val.message}<>${val.stack}]`;
        }
        else if (val.state && val._vm) {
            return encodeCache.cache(val, () => (0, backend_1.getCustomStoreDetails)(val));
        }
        else if (val.constructor && val.constructor.name === 'VueRouter') {
            return encodeCache.cache(val, () => (0, backend_1.getCustomRouterDetails)(val));
        }
        else if ((0, backend_1.isVueInstance)(val)) {
            return encodeCache.cache(val, () => (0, backend_1.getCustomInstanceDetails)(val));
        }
        else if (typeof val.render === 'function') {
            return encodeCache.cache(val, () => getCustomComponentDefinitionDetails(val));
        }
        else if (val.constructor && val.constructor.name === 'VNode') {
            return `[native VNode <${val.tag}>]`;
        }
        else if (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) {
            return encodeCache.cache(val, () => getCustomHTMLElementDetails(val));
        }
        else if (((_a = val.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'Store' && val._wrappedGetters) {
            return `[object Store]`;
        }
        else if (val.currentRoute) {
            return `[object Router]`;
        }
        const customDetails = (0, backend_1.getCustomObjectDetails)(val, proto);
        if (customDetails != null)
            return customDetails;
    }
    else if (Number.isNaN(val)) {
        return exports.NAN;
    }
    return sanitize(val);
}
// @TODO revive from backend to have more data to the clipboard
function replaceForUser(key) {
    // @ts-ignore
    let val = this[key];
    const type = typeof val;
    if ((val === null || val === void 0 ? void 0 : val._custom) && 'value' in val._custom) {
        val = val._custom.value;
    }
    if (type !== 'object') {
        if (val === exports.UNDEFINED) {
            return undefined;
        }
        else if (val === exports.INFINITY) {
            return Infinity;
        }
        else if (val === exports.NEGATIVE_INFINITY) {
            return -Infinity;
        }
        else if (val === exports.NAN) {
            return NaN;
        }
        return val;
    }
    return sanitize(val);
}
function getCustomMapDetails(val) {
    const list = [];
    val.forEach((value, key) => list.push({
        key,
        value,
    }));
    return {
        _custom: {
            type: 'map',
            display: 'Map',
            value: list,
            readOnly: true,
            fields: {
                abstract: true,
            },
        },
    };
}
exports.getCustomMapDetails = getCustomMapDetails;
function reviveMap(val) {
    const result = new Map();
    const list = val._custom.value;
    for (let i = 0; i < list.length; i++) {
        const { key, value } = list[i];
        result.set(key, revive(value));
    }
    return result;
}
exports.reviveMap = reviveMap;
function getCustomSetDetails(val) {
    const list = Array.from(val);
    return {
        _custom: {
            type: 'set',
            display: `Set[${list.length}]`,
            value: list,
            readOnly: true,
        },
    };
}
exports.getCustomSetDetails = getCustomSetDetails;
function reviveSet(val) {
    const result = new Set();
    const list = val._custom.value;
    for (let i = 0; i < list.length; i++) {
        const value = list[i];
        result.add(revive(value));
    }
    return result;
}
exports.reviveSet = reviveSet;
// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename(filename, ext) {
    return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}
function getComponentName(options) {
    const name = options.displayName || options.name || options._componentTag;
    if (name) {
        return name;
    }
    const file = options.__file; // injected by vue-loader
    if (file) {
        return (0, exports.classify)(basename(file, '.vue'));
    }
}
exports.getComponentName = getComponentName;
function getCustomComponentDefinitionDetails(def) {
    let display = getComponentName(def);
    if (display) {
        if (def.name && def.__file) {
            display += ` <span>(${def.__file})</span>`;
        }
    }
    else {
        display = '<i>Unknown Component</i>';
    }
    return {
        _custom: {
            type: 'component-definition',
            display,
            tooltip: 'Component definition',
            ...def.__file
                ? {
                    file: def.__file,
                }
                : {},
        },
    };
}
exports.getCustomComponentDefinitionDetails = getCustomComponentDefinitionDetails;
// eslint-disable-next-line @typescript-eslint/ban-types
function getCustomFunctionDetails(func) {
    let string = '';
    let matches = null;
    try {
        string = Function.prototype.toString.call(func);
        matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
    }
    catch (e) {
        // Func is probably a Proxy, which can break Function.prototype.toString()
    }
    // Trim any excess whitespace from the argument string
    const match = matches && matches[0];
    const args = typeof match === 'string'
        ? match
        : '(?)';
    const name = typeof func.name === 'string' ? func.name : '';
    return {
        _custom: {
            type: 'function',
            display: `<span style="opacity:.5;">function</span> ${escape(name)}${args}`,
            tooltip: string.trim() ? `<pre>${string}</pre>` : null,
            _reviveId: reviveCache.cache(func),
        },
    };
}
exports.getCustomFunctionDetails = getCustomFunctionDetails;
function getCustomHTMLElementDetails(value) {
    try {
        return {
            _custom: {
                type: 'HTMLElement',
                display: `<span class="opacity-30">&lt;</span><span class="text-blue-500">${value.tagName.toLowerCase()}</span><span class="opacity-30">&gt;</span>`,
                value: namedNodeMapToObject(value.attributes),
                actions: [
                    {
                        icon: 'input',
                        tooltip: 'Log element to console',
                        action: () => {
                            // eslint-disable-next-line no-console
                            console.log(value);
                        },
                    },
                ],
            },
        };
    }
    catch (e) {
        return {
            _custom: {
                type: 'HTMLElement',
                display: `<span class="text-blue-500">${String(value)}</span>`,
            },
        };
    }
}
exports.getCustomHTMLElementDetails = getCustomHTMLElementDetails;
function namedNodeMapToObject(map) {
    const result = {};
    const l = map.length;
    for (let i = 0; i < l; i++) {
        const node = map.item(i);
        result[node.name] = node.value;
    }
    return result;
}
function getCustomRefDetails(instance, key, ref) {
    let value;
    if (Array.isArray(ref)) {
        value = ref.map((r) => getCustomRefDetails(instance, key, r)).map(data => data.value);
    }
    else {
        let name;
        if (ref._isVue) {
            name = getComponentName(ref.$options);
        }
        else {
            name = ref.tagName.toLowerCase();
        }
        value = {
            _custom: {
                display: `&lt;${name}` +
                    (ref.id ? ` <span class="attr-title">id</span>="${ref.id}"` : '') +
                    (ref.className ? ` <span class="attr-title">class</span>="${ref.className}"` : '') + '&gt;',
                uid: instance.__VUE_DEVTOOLS_UID__,
                type: 'reference',
            },
        };
    }
    return {
        type: '$refs',
        key: key,
        value,
        editable: false,
    };
}
exports.getCustomRefDetails = getCustomRefDetails;
function parse(data, revive = false) {
    return revive
        ? (0, transfer_1.parseCircularAutoChunks)(data, reviver)
        : (0, transfer_1.parseCircularAutoChunks)(data);
}
exports.parse = parse;
const specialTypeRE = /^\[native (\w+) (.*?)(<>((.|\s)*))?\]$/;
const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
function reviver(key, val) {
    return revive(val);
}
function revive(val) {
    if (val === exports.UNDEFINED) {
        return undefined;
    }
    else if (val === exports.INFINITY) {
        return Infinity;
    }
    else if (val === exports.NEGATIVE_INFINITY) {
        return -Infinity;
    }
    else if (val === exports.NAN) {
        return NaN;
    }
    else if (val && val._custom) {
        const { _custom: custom } = val;
        if (custom.type === 'component') {
            return (0, backend_1.getInstanceMap)().get(custom.id);
        }
        else if (custom.type === 'map') {
            return reviveMap(val);
        }
        else if (custom.type === 'set') {
            return reviveSet(val);
        }
        else if (custom._reviveId) {
            return reviveCache.read(custom._reviveId);
        }
        else {
            return revive(custom.value);
        }
    }
    else if (symbolRE.test(val)) {
        const [, string] = symbolRE.exec(val);
        return Symbol.for(string);
    }
    else if (specialTypeRE.test(val)) {
        const [, type, string, , details] = specialTypeRE.exec(val);
        const result = new env_1.target[type](string);
        if (type === 'Error' && details) {
            result.stack = details;
        }
        return result;
    }
    else {
        return val;
    }
}
exports.revive = revive;
/**
 * Sanitize data to be posted to the other side.
 * Since the message posted is sent with structured clone,
 * we need to filter out any types that might cause an error.
 *
 * @param {*} data
 * @return {*}
 */
function sanitize(data) {
    if (!isPrimitive(data) &&
        !Array.isArray(data) &&
        !isPlainObject(data)) {
        // handle types that will probably cause issues in
        // the structured clone
        return Object.prototype.toString.call(data);
    }
    else {
        return data;
    }
}
function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
exports.isPlainObject = isPlainObject;
function isPrimitive(data) {
    if (data == null) {
        return true;
    }
    const type = typeof data;
    return (type === 'string' ||
        type === 'number' ||
        type === 'boolean');
}
/**
 * Searches a key or value in the object, with a maximum deepness
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function searchDeepInObject(obj, searchTerm) {
    const seen = new Map();
    const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0);
    seen.clear();
    return result;
}
exports.searchDeepInObject = searchDeepInObject;
const SEARCH_MAX_DEPTH = 10;
/**
 * Executes a search on each field of the provided object
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchObject(obj, searchTerm, seen, depth) {
    if (depth > SEARCH_MAX_DEPTH) {
        return false;
    }
    let match = false;
    const keys = Object.keys(obj);
    let key, value;
    for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        value = obj[key];
        match = internalSearchCheck(searchTerm, key, value, seen, depth + 1);
        if (match) {
            break;
        }
    }
    return match;
}
/**
 * Executes a search on each value of the provided array
 * @param {*} array Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchArray(array, searchTerm, seen, depth) {
    if (depth > SEARCH_MAX_DEPTH) {
        return false;
    }
    let match = false;
    let value;
    for (let i = 0; i < array.length; i++) {
        value = array[i];
        match = internalSearchCheck(searchTerm, null, value, seen, depth + 1);
        if (match) {
            break;
        }
    }
    return match;
}
/**
 * Checks if the provided field matches the search terms
 * @param {string} searchTerm Search string
 * @param {string} key Field key (null if from array)
 * @param {*} value Field value
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchCheck(searchTerm, key, value, seen, depth) {
    let match = false;
    let result;
    if (key === '_custom') {
        key = value.display;
        value = value.value;
    }
    (result = specialTokenToString(value)) && (value = result);
    if (key && compare(key, searchTerm)) {
        match = true;
        seen.set(value, true);
    }
    else if (seen.has(value)) {
        match = seen.get(value);
    }
    else if (Array.isArray(value)) {
        seen.set(value, null);
        match = internalSearchArray(value, searchTerm, seen, depth);
        seen.set(value, match);
    }
    else if (isPlainObject(value)) {
        seen.set(value, null);
        match = internalSearchObject(value, searchTerm, seen, depth);
        seen.set(value, match);
    }
    else if (compare(value, searchTerm)) {
        match = true;
        seen.set(value, true);
    }
    return match;
}
/**
 * Compares two values
 * @param {*} value Mixed type value that will be cast to string
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function compare(value, searchTerm) {
    return ('' + value).toLowerCase().indexOf(searchTerm) !== -1;
}
function sortByKey(state) {
    return state && state.slice().sort((a, b) => {
        if (a.key < b.key)
            return -1;
        if (a.key > b.key)
            return 1;
        return 0;
    });
}
exports.sortByKey = sortByKey;
function simpleGet(object, path) {
    const sections = Array.isArray(path) ? path : path.split('.');
    for (let i = 0; i < sections.length; i++) {
        object = object[sections[i]];
        if (!object) {
            return undefined;
        }
    }
    return object;
}
exports.simpleGet = simpleGet;
function focusInput(el) {
    el.focus();
    el.setSelectionRange(0, el.value.length);
}
exports.focusInput = focusInput;
function openInEditor(file) {
    // Console display
    const fileName = file.replace(/\\/g, '\\\\');
    const src = `fetch('${shared_data_1.SharedData.openInEditorHost}__open-in-editor?file=${encodeURI(file)}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://devtools.vuejs.org/guide/open-in-editor.html')
    }
  })`;
    if (env_1.isChrome) {
        env_1.target.chrome.devtools.inspectedWindow.eval(src);
    }
    else {
        // eslint-disable-next-line no-eval
        eval(src);
    }
}
exports.openInEditor = openInEditor;
const ESC = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;',
};
function escape(s) {
    return s.replace(/[<>"&]/g, escapeChar);
}
exports.escape = escape;
function escapeChar(a) {
    return ESC[a] || a;
}
function copyToClipboard(state) {
    let text;
    if (typeof state !== 'object') {
        text = String(state);
    }
    else {
        text = stringify(state, 'user');
    }
    // @TODO navigator.clipboard is buggy in extensions
    if (typeof document === 'undefined')
        return;
    const dummyTextArea = document.createElement('textarea');
    dummyTextArea.textContent = text;
    document.body.appendChild(dummyTextArea);
    dummyTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(dummyTextArea);
}
exports.copyToClipboard = copyToClipboard;
function isEmptyObject(obj) {
    return obj === exports.UNDEFINED || !obj || Object.keys(obj).length === 0;
}
exports.isEmptyObject = isEmptyObject;
//# sourceMappingURL=util.js.map