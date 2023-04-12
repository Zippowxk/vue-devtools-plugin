"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backend = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const data_1 = require("./components/data");
const el_1 = require("./components/el");
const perf_js_1 = require("./components/perf.js");
const tree_1 = require("./components/tree");
const update_tracking_js_1 = require("./components/update-tracking.js");
const util_1 = require("./components/util");
const events_1 = require("./events");
const plugin_1 = require("./plugin");
exports.backend = (0, app_backend_api_1.defineBackend)({
    frameworkVersion: 2,
    features: [
        app_backend_api_1.BuiltinBackendFeature.FLUSH,
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app.name) {
                payload.name = payload.app.name;
            }
            else if (payload.app.$options.name) {
                payload.name = payload.app.$options.name;
            }
        });
        api.on.getAppRootInstance(payload => {
            payload.root = payload.app;
        });
        api.on.walkComponentTree(async (payload, ctx) => {
            payload.componentTreeData = await (0, tree_1.walkTree)(payload.componentInstance, payload.filter, payload.recursively, api, ctx);
        });
        api.on.walkComponentParents((payload, ctx) => {
            payload.parentInstances = (0, tree_1.getComponentParents)(payload.componentInstance, api, ctx);
        });
        api.on.inspectComponent(payload => {
            injectToUtils();
            payload.instanceData = (0, data_1.getInstanceDetails)(payload.componentInstance);
        });
        api.on.getComponentBounds(payload => {
            payload.bounds = (0, el_1.getInstanceOrVnodeRect)(payload.componentInstance);
        });
        api.on.getComponentName(payload => {
            const instance = payload.componentInstance;
            payload.name = instance.fnContext ? (0, shared_utils_1.getComponentName)(instance.fnOptions) : (0, util_1.getInstanceName)(instance);
        });
        api.on.getElementComponent(payload => {
            payload.componentInstance = (0, el_1.findRelatedComponent)(payload.element);
        });
        api.on.editComponentState(payload => {
            (0, data_1.editState)(payload, api.stateEditor);
        });
        api.on.getComponentRootElements(payload => {
            payload.rootElements = (0, el_1.getRootElementsFromComponentInstance)(payload.componentInstance);
        });
        api.on.getComponentDevtoolsOptions(payload => {
            payload.options = payload.componentInstance.$options.devtools;
        });
        api.on.getComponentRenderCode(payload => {
            payload.code = payload.componentInstance.$options.render.toString();
        });
        api.on.getComponentInstances(() => {
            console.warn('on.getComponentInstances is not implemented for Vue 2');
        });
    },
    setupApp(api, appRecord) {
        const { Vue } = appRecord.options.meta;
        const app = appRecord.options.app;
        // State editor overrides
        api.stateEditor.createDefaultSetCallback = state => {
            return (obj, field, value) => {
                if (state.remove || state.newKey)
                    Vue.delete(obj, field);
                if (!state.remove)
                    Vue.set(obj, state.newKey || field, value);
            };
        };
        // Utils
        injectToUtils();
        (0, events_1.wrapVueForEvents)(app, Vue, api.ctx);
        // Plugin
        (0, plugin_1.setupPlugin)(api, app, Vue);
        // Perf
        (0, perf_js_1.initPerf)(api, app, Vue);
        // Update tracking
        (0, update_tracking_js_1.initUpdateTracking)(api, Vue);
    },
});
// @TODO refactor
function injectToUtils() {
    shared_utils_1.backendInjections.getCustomInstanceDetails = data_1.getCustomInstanceDetails;
    shared_utils_1.backendInjections.getCustomObjectDetails = () => undefined;
    shared_utils_1.backendInjections.instanceMap = tree_1.instanceMap;
    shared_utils_1.backendInjections.isVueInstance = val => val._isVue;
}
//# sourceMappingURL=index.js.map