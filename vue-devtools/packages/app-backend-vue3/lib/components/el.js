"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceOrVnodeRect = exports.getRootElementsFromComponentInstance = exports.getComponentInstanceFromElement = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const util_1 = require("./util");
function getComponentInstanceFromElement(element) {
    return element.__vueParentComponent;
}
exports.getComponentInstanceFromElement = getComponentInstanceFromElement;
function getRootElementsFromComponentInstance(instance) {
    if (util_1.isFragment(instance)) {
        return getFragmentRootElements(instance.subTree);
    }
    return [instance.subTree.el];
}
exports.getRootElementsFromComponentInstance = getRootElementsFromComponentInstance;
function getFragmentRootElements(vnode) {
    if (!vnode.children)
        return [];
    const list = [];
    for (let i = 0, l = vnode.children.length; i < l; i++) {
        const childVnode = vnode.children[i];
        if (childVnode.component) {
            list.push(...getRootElementsFromComponentInstance(childVnode.component));
        }
        else if (childVnode.el) {
            list.push(childVnode.el);
        }
    }
    return list;
}
/**
 * Get the client rect for an instance.
 *
 * @param {Vue|Vnode} instance
 * @return {Object}
 */
function getInstanceOrVnodeRect(instance) {
    const el = instance.subTree.el;
    if (!shared_utils_1.isBrowser) {
        // @TODO: Find position from instance or a vnode (for functional components).
        return;
    }
    if (!shared_utils_1.inDoc(el)) {
        return;
    }
    if (util_1.isFragment(instance)) {
        return addIframePosition(getFragmentRect(instance.subTree), getElWindow(el));
    }
    else if (el.nodeType === 1) {
        return addIframePosition(el.getBoundingClientRect(), getElWindow(el));
    }
}
exports.getInstanceOrVnodeRect = getInstanceOrVnodeRect;
function createRect() {
    const rect = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        get width() { return rect.right - rect.left; },
        get height() { return rect.bottom - rect.top; }
    };
    return rect;
}
function mergeRects(a, b) {
    if (!a.top || b.top < a.top) {
        a.top = b.top;
    }
    if (!a.bottom || b.bottom > a.bottom) {
        a.bottom = b.bottom;
    }
    if (!a.left || b.left < a.left) {
        a.left = b.left;
    }
    if (!a.right || b.right > a.right) {
        a.right = b.right;
    }
    return a;
}
let range;
/**
 * Get the bounding rect for a text node using a Range.
 *
 * @param {Text} node
 * @return {Rect}
 */
function getTextRect(node) {
    if (!shared_utils_1.isBrowser)
        return;
    if (!range)
        range = document.createRange();
    range.selectNode(node);
    return range.getBoundingClientRect();
}
function getFragmentRect(vnode) {
    const rect = createRect();
    if (!vnode.children)
        return rect;
    for (let i = 0, l = vnode.children.length; i < l; i++) {
        const childVnode = vnode.children[i];
        let childRect;
        if (childVnode.component) {
            childRect = getInstanceOrVnodeRect(childVnode.component);
        }
        else if (childVnode.el) {
            const el = childVnode.el;
            if (el.nodeType === 1 || el.getBoundingClientRect) {
                childRect = el.getBoundingClientRect();
            }
            else if (el.nodeType === 3 && el.data.trim()) {
                childRect = getTextRect(el);
            }
        }
        if (childRect) {
            mergeRects(rect, childRect);
        }
    }
    return rect;
}
function getElWindow(el) {
    return el.ownerDocument.defaultView;
}
function addIframePosition(bounds, win) {
    if (win.__VUE_DEVTOOLS_IFRAME__) {
        const rect = mergeRects(createRect(), bounds);
        const iframeBounds = win.__VUE_DEVTOOLS_IFRAME__.getBoundingClientRect();
        rect.top += iframeBounds.top;
        rect.bottom += iframeBounds.top;
        rect.left += iframeBounds.left;
        rect.right += iframeBounds.left;
        if (win.parent) {
            return addIframePosition(rect, win.parent);
        }
        return rect;
    }
    return bounds;
}
//# sourceMappingURL=el.js.map