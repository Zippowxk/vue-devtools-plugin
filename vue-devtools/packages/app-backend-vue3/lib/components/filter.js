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
        const name = (0, util_1.getInstanceName)(instance);
        return (0, shared_utils_1.classify)(name).toLowerCase().indexOf(this.filter) > -1 ||
            (0, shared_utils_1.kebabize)(name).toLowerCase().indexOf(this.filter) > -1;
    }
}
exports.ComponentFilter = ComponentFilter;
//# sourceMappingURL=filter.js.map