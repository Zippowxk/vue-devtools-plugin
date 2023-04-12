"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const page_config_1 = require("../page-config");
const rootInstances = [];
/**
 * Scan the page for root level Vue instances.
 */
function scan() {
    rootInstances.length = 0;
    let inFragment = false;
    let currentFragment = null;
    // eslint-disable-next-line no-inner-declarations
    function processInstance(instance) {
        if (instance) {
            if (rootInstances.indexOf(instance.$root) === -1) {
                instance = instance.$root;
            }
            if (instance._isFragment) {
                inFragment = true;
                currentFragment = instance;
            }
            // respect Vue.config.devtools option
            let baseVue = instance.constructor;
            while (baseVue.super) {
                baseVue = baseVue.super;
            }
            if (baseVue.config && baseVue.config.devtools) {
                rootInstances.push(instance);
            }
            return true;
        }
    }
    if (shared_utils_1.isBrowser) {
        const walkDocument = document => {
            walk(document, function (node) {
                if (inFragment) {
                    if (node === currentFragment._fragmentEnd) {
                        inFragment = false;
                        currentFragment = null;
                    }
                    return true;
                }
                const instance = node.__vue__;
                return processInstance(instance);
            });
        };
        walkDocument(document);
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                walkDocument(iframe.contentDocument);
            }
            catch (e) {
                // Ignore
            }
        }
        // Scan for Vue instances in the customTarget elements
        const { customVue2ScanSelector } = (0, page_config_1.getPageConfig)();
        const customTargets = customVue2ScanSelector ? document.querySelectorAll(customVue2ScanSelector) : [];
        for (const customTarget of customTargets) {
            try {
                walkDocument(customTarget);
            }
            catch (e) {
                // Ignore
            }
        }
    }
    else {
        if (Array.isArray(shared_utils_1.target.__VUE_ROOT_INSTANCES__)) {
            shared_utils_1.target.__VUE_ROOT_INSTANCES__.map(processInstance);
        }
    }
    return rootInstances;
}
exports.scan = scan;
/**
 * DOM walk helper
 *
 * @param {NodeList} nodes
 * @param {Function} fn
 */
function walk(node, fn) {
    if (node.childNodes) {
        for (let i = 0, l = node.childNodes.length; i < l; i++) {
            const child = node.childNodes[i];
            const stop = fn(child);
            if (!stop) {
                walk(child, fn);
            }
        }
    }
    // also walk shadow DOM
    if (node.shadowRoot) {
        walk(node.shadowRoot, fn);
    }
}
//# sourceMappingURL=scan.js.map