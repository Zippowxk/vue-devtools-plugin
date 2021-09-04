"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOnPageConfig = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const shared_data_1 = __importDefault(require("@vue-devtools/shared-utils/lib/shared-data"));
function initOnPageConfig() {
    // User project devtools config
    if (Object.hasOwnProperty.call(shared_utils_1.target, 'VUE_DEVTOOLS_CONFIG')) {
        const config = shared_utils_1.target.VUE_DEVTOOLS_CONFIG;
        // Open in editor
        if (Object.hasOwnProperty.call(config, 'openInEditorHost')) {
            shared_data_1.default.openInEditorHost = config.openInEditorHost;
        }
    }
}
exports.initOnPageConfig = initOnPageConfig;
//# sourceMappingURL=page-config.js.map