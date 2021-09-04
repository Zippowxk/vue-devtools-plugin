"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backend = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const data_1 = require("./components/data");
const el_1 = require("./components/el");
const tree_1 = require("./components/tree");
const util_1 = require("./components/util");
const events_1 = require("./events");
const plugin_1 = require("./plugin");
exports.backend = {
    frameworkVersion: 2,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS,
        app_backend_api_1.BuiltinBackendFeature.FLUSH
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app.name) {
                payload.name = payload.app.name;
            }
        });
        api.on.getAppRootInstance(payload => {
            payload.root = payload.app;
        });
        api.on.walkComponentTree((payload, ctx) => {
            payload.componentTreeData = tree_1.walkTree(payload.componentInstance, payload.filter, ctx);
        });
        api.on.walkComponentParents((payload, ctx) => {
            payload.parentInstances = tree_1.getComponentParents(payload.componentInstance, ctx);
        });
        api.on.inspectComponent(payload => {
            injectToUtils();
            payload.instanceData = data_1.getInstanceDetails(payload.componentInstance);
        });
        api.on.getComponentBounds(payload => {
            payload.bounds = el_1.getInstanceOrVnodeRect(payload.componentInstance);
        });
        api.on.getComponentName(payload => {
            const instance = payload.componentInstance;
            payload.name = instance.fnContext ? shared_utils_1.getComponentName(instance.fnOptions) : util_1.getInstanceName(instance);
        });
        api.on.getElementComponent(payload => {
            payload.componentInstance = el_1.findRelatedComponent(payload.element);
        });
        api.on.editComponentState(payload => {
            data_1.editState(payload);
        });
        api.on.getComponentRootElements(payload => {
            payload.rootElements = [payload.componentInstance.$el];
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
        injectToUtils();
        const { Vue } = appRecord.options.meta;
        const app = appRecord.options.app;
        events_1.wrapVueForEvents(app, Vue, api.ctx);
        plugin_1.setupPlugin(api, app);
    }
};
function injectToUtils() {
    shared_utils_1.backendInjections.getCustomInstanceDetails = data_1.getCustomInstanceDetails;
    shared_utils_1.backendInjections.instanceMap = tree_1.instanceMap;
    shared_utils_1.backendInjections.isVueInstance = val => val._isVue;
}
//# sourceMappingURL=index.js.map