"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hook = void 0;
Object.defineProperty(exports, "hook", { value: void 0, configurable: true});
const shared_utils_1 = require("@vue-devtools/shared-utils");
// hook should have been injected before this executes.
Object.defineProperty(exports, "hook", { get(){
  return shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__
},
  configurable: true
,});

// exports.hook = shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
//# sourceMappingURL=global-hook.js.map