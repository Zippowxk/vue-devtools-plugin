"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOnPageConfig = exports.getPageConfig = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
let config = {};
function getPageConfig() {
    return config;
}
exports.getPageConfig = getPageConfig;
function initOnPageConfig() {
    // User project devtools config
    if (Object.hasOwnProperty.call(shared_utils_1.target, 'VUE_DEVTOOLS_CONFIG')) {
        config = shared_utils_1.SharedData.pageConfig = shared_utils_1.target.VUE_DEVTOOLS_CONFIG;
        // Open in editor
        if (Object.hasOwnProperty.call(config, 'openInEditorHost')) {
            shared_utils_1.SharedData.openInEditorHost = config.openInEditorHost;
        }
    }
}
exports.initOnPageConfig = initOnPageConfig;
//# sourceMappingURL=page-config.js.map