"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_utils_1 = require("@vue-devtools/shared-utils");
const highlighter_1 = require("./highlighter");
class ComponentPicker {
    constructor(ctx) {
        this.ctx = ctx;
        this.bindMethods();
    }
    /**
     * Adds event listeners for mouseover and mouseup
     */
    startSelecting() {
        if (!shared_utils_1.isBrowser)
            return;
        window.addEventListener('mouseover', this.elementMouseOver, true);
        window.addEventListener('click', this.elementClicked, true);
        window.addEventListener('mouseout', this.cancelEvent, true);
        window.addEventListener('mouseenter', this.cancelEvent, true);
        window.addEventListener('mouseleave', this.cancelEvent, true);
        window.addEventListener('mousedown', this.cancelEvent, true);
        window.addEventListener('mouseup', this.cancelEvent, true);
    }
    /**
     * Removes event listeners
     */
    stopSelecting() {
        if (!shared_utils_1.isBrowser)
            return;
        window.removeEventListener('mouseover', this.elementMouseOver, true);
        window.removeEventListener('click', this.elementClicked, true);
        window.removeEventListener('mouseout', this.cancelEvent, true);
        window.removeEventListener('mouseenter', this.cancelEvent, true);
        window.removeEventListener('mouseleave', this.cancelEvent, true);
        window.removeEventListener('mousedown', this.cancelEvent, true);
        window.removeEventListener('mouseup', this.cancelEvent, true);
        highlighter_1.unHighlight();
    }
    /**
     * Highlights a component on element mouse over
     */
    async elementMouseOver(e) {
        this.cancelEvent(e);
        const el = e.target;
        if (el) {
            this.selectedInstance = await this.ctx.api.getElementComponent(el);
        }
        highlighter_1.unHighlight();
        if (this.selectedInstance) {
            highlighter_1.highlight(this.selectedInstance, this.ctx);
        }
    }
    /**
     * Selects an instance in the component view
     */
    async elementClicked(e) {
        this.cancelEvent(e);
        if (this.selectedInstance) {
            const parentInstances = await this.ctx.api.walkComponentParents(this.selectedInstance);
            this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK, { id: this.selectedInstance.__VUE_DEVTOOLS_UID__, parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__) });
        }
        else {
            this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK_CANCELED, null);
        }
        this.stopSelecting();
    }
    /**
     * Cancel a mouse event
     */
    cancelEvent(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
    /**
     * Bind class methods to the class scope to avoid rebind for event listeners
     */
    bindMethods() {
        this.startSelecting = this.startSelecting.bind(this);
        this.stopSelecting = this.stopSelecting.bind(this);
        this.elementMouseOver = this.elementMouseOver.bind(this);
        this.elementClicked = this.elementClicked.bind(this);
    }
}
exports.default = ComponentPicker;
//# sourceMappingURL=component-pick.js.map