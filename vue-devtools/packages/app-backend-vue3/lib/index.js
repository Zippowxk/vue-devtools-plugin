"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backend = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const tree_1 = require("./components/tree");
const data_1 = require("./components/data");
const util_1 = require("./components/util");
const el_1 = require("./components/el");
const shared_utils_1 = require("@vue-devtools/shared-utils");
exports.backend = {
    frameworkVersion: 3,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app._component) {
                payload.name = payload.app._component.name;
            }
        });
        api.on.getAppRootInstance(payload => {
            var _a, _b, _c, _d;
            if (payload.app._instance) {
                payload.root = payload.app._instance;
            }
            else if ((_b = (_a = payload.app._container) === null || _a === void 0 ? void 0 : _a._vnode) === null || _b === void 0 ? void 0 : _b.component) {
                payload.root = (_d = (_c = payload.app._container) === null || _c === void 0 ? void 0 : _c._vnode) === null || _d === void 0 ? void 0 : _d.component;
            }
        });
        api.on.walkComponentTree(async (payload, ctx) => {
            const walker = new tree_1.ComponentWalker(payload.maxDepth, payload.filter, ctx);
            payload.componentTreeData = await walker.getComponentTree(payload.componentInstance);
        });
        api.on.walkComponentParents((payload, ctx) => {
            const walker = new tree_1.ComponentWalker(0, null, ctx);
            payload.parentInstances = walker.getComponentParents(payload.componentInstance);
        });
        api.on.inspectComponent((payload, ctx) => {
            shared_utils_1.backendInjections.getCustomInstanceDetails = data_1.getCustomInstanceDetails;
            shared_utils_1.backendInjections.instanceMap = ctx.currentAppRecord.instanceMap;
            shared_utils_1.backendInjections.isVueInstance = val => val._ && Object.keys(val._).includes('vnode');
            payload.instanceData = data_1.getInstanceDetails(payload.componentInstance, ctx);
        });
        api.on.getComponentName(payload => {
            payload.name = util_1.getInstanceName(payload.componentInstance);
        });
        api.on.getComponentBounds(payload => {
            payload.bounds = el_1.getInstanceOrVnodeRect(payload.componentInstance);
        });
        api.on.getElementComponent(payload => {
            payload.componentInstance = el_1.getComponentInstanceFromElement(payload.element);
        });
        api.on.getComponentInstances(payload => {
            payload.componentInstances = util_1.getComponentInstances(payload.app);
        });
        api.on.getComponentRootElements(payload => {
            payload.rootElements = el_1.getRootElementsFromComponentInstance(payload.componentInstance);
        });
        api.on.editComponentState((payload, ctx) => {
            data_1.editState(payload, ctx);
        });
        api.on.getComponentDevtoolsOptions(payload => {
            payload.options = payload.componentInstance.type.devtools;
        });
        api.on.getComponentRenderCode(payload => {
            payload.code = payload.componentInstance.render.toString();
        });
        api.on.transformCall(payload => {
            if (payload.callName === shared_utils_1.HookEvents.COMPONENT_UPDATED) {
                const component = payload.inArgs[0];
                payload.outArgs = [
                    component.appContext.app,
                    component.uid,
                    component.parent ? component.parent.uid : undefined,
                    component
                ];
            }
        });
        // @TODO
    }
};
//# sourceMappingURL=index.js.map