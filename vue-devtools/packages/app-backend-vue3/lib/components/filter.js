"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentFilter = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const util_1 = require("./util");
class ComponentFilter {
    constructor(filter) {
        this.filter = filter || '';
    }
    /**
     * Check if an instance is qualified.
     *
     * @param {Vue|Vnode} instance
     * @return {Boolean}
     */
    isQualified(instance) {
        const name = shared_utils_1.classify(util_1.getInstanceName(instance)).toLowerCase();
        return name.indexOf(this.filter) > -1;
    }
}
exports.ComponentFilter = ComponentFilter;
//# sourceMappingURL=filter.js.map