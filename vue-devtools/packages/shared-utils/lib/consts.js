"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HookEvents = exports.BridgeSubscriptions = exports.BridgeEvents = exports.BuiltinTabs = void 0;
var BuiltinTabs;
(function (BuiltinTabs) {
    BuiltinTabs["COMPONENTS"] = "components";
    BuiltinTabs["TIMELINE"] = "timeline";
    BuiltinTabs["PLUGINS"] = "plugins";
    BuiltinTabs["SETTINGS"] = "settings";
})(BuiltinTabs = exports.BuiltinTabs || (exports.BuiltinTabs = {}));
var BridgeEvents;
(function (BridgeEvents) {
    // Misc
    BridgeEvents["TO_BACK_SUBSCRIBE"] = "b:subscribe";
    BridgeEvents["TO_BACK_UNSUBSCRIBE"] = "b:unsubscribe";
    /** Backend is ready */
    BridgeEvents["TO_FRONT_READY"] = "f:ready";
    /** Displays the "detected Vue" console log */
    BridgeEvents["TO_BACK_LOG_DETECTED_VUE"] = "b:log-detected-vue";
    /** Force refresh */
    BridgeEvents["TO_BACK_REFRESH"] = "b:refresh";
    /** Tab was switched */
    BridgeEvents["TO_BACK_TAB_SWITCH"] = "b:tab:switch";
    BridgeEvents["TO_BACK_LOG"] = "b:log";
    /** Reconnected after background script is terminated (idle) */
    BridgeEvents["TO_FRONT_RECONNECTED"] = "f:reconnected";
    /** Change app title (electron) */
    BridgeEvents["TO_FRONT_TITLE"] = "f:title";
    // Apps
    /** App was registered */
    BridgeEvents["TO_FRONT_APP_ADD"] = "f:app:add";
    /** Get app list */
    BridgeEvents["TO_BACK_APP_LIST"] = "b:app:list";
    BridgeEvents["TO_FRONT_APP_LIST"] = "f:app:list";
    BridgeEvents["TO_FRONT_APP_REMOVE"] = "f:app:remove";
    BridgeEvents["TO_BACK_APP_SELECT"] = "b:app:select";
    BridgeEvents["TO_FRONT_APP_SELECTED"] = "f:app:selected";
    BridgeEvents["TO_BACK_SCAN_LEGACY_APPS"] = "b:app:scan-legacy";
    // Components
    BridgeEvents["TO_BACK_COMPONENT_TREE"] = "b:component:tree";
    BridgeEvents["TO_FRONT_COMPONENT_TREE"] = "f:component:tree";
    BridgeEvents["TO_BACK_COMPONENT_SELECTED_DATA"] = "b:component:selected-data";
    BridgeEvents["TO_FRONT_COMPONENT_SELECTED_DATA"] = "f:component:selected-data";
    BridgeEvents["TO_BACK_COMPONENT_EXPAND"] = "b:component:expand";
    BridgeEvents["TO_FRONT_COMPONENT_EXPAND"] = "f:component:expand";
    BridgeEvents["TO_BACK_COMPONENT_SCROLL_TO"] = "b:component:scroll-to";
    BridgeEvents["TO_BACK_COMPONENT_FILTER"] = "b:component:filter";
    BridgeEvents["TO_BACK_COMPONENT_MOUSE_OVER"] = "b:component:mouse-over";
    BridgeEvents["TO_BACK_COMPONENT_MOUSE_OUT"] = "b:component:mouse-out";
    BridgeEvents["TO_BACK_COMPONENT_CONTEXT_MENU_TARGET"] = "b:component:context-menu-target";
    BridgeEvents["TO_BACK_COMPONENT_EDIT_STATE"] = "b:component:edit-state";
    BridgeEvents["TO_BACK_COMPONENT_PICK"] = "b:component:pick";
    BridgeEvents["TO_FRONT_COMPONENT_PICK"] = "f:component:pick";
    BridgeEvents["TO_BACK_COMPONENT_PICK_CANCELED"] = "b:component:pick-canceled";
    BridgeEvents["TO_FRONT_COMPONENT_PICK_CANCELED"] = "f:component:pick-canceled";
    BridgeEvents["TO_BACK_COMPONENT_INSPECT_DOM"] = "b:component:inspect-dom";
    BridgeEvents["TO_FRONT_COMPONENT_INSPECT_DOM"] = "f:component:inspect-dom";
    BridgeEvents["TO_BACK_COMPONENT_RENDER_CODE"] = "b:component:render-code";
    BridgeEvents["TO_FRONT_COMPONENT_RENDER_CODE"] = "f:component:render-code";
    BridgeEvents["TO_FRONT_COMPONENT_UPDATED"] = "f:component:updated";
    // Timeline
    BridgeEvents["TO_FRONT_TIMELINE_EVENT"] = "f:timeline:event";
    BridgeEvents["TO_BACK_TIMELINE_LAYER_LIST"] = "b:timeline:layer-list";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_LIST"] = "f:timeline:layer-list";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_ADD"] = "f:timeline:layer-add";
    BridgeEvents["TO_BACK_TIMELINE_SHOW_SCREENSHOT"] = "b:timeline:show-screenshot";
    BridgeEvents["TO_BACK_TIMELINE_CLEAR"] = "b:timeline:clear";
    BridgeEvents["TO_BACK_TIMELINE_EVENT_DATA"] = "b:timeline:event-data";
    BridgeEvents["TO_FRONT_TIMELINE_EVENT_DATA"] = "f:timeline:event-data";
    BridgeEvents["TO_BACK_TIMELINE_LAYER_LOAD_EVENTS"] = "b:timeline:layer-load-events";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS"] = "f:timeline:layer-load-events";
    BridgeEvents["TO_BACK_TIMELINE_LOAD_MARKERS"] = "b:timeline:load-markers";
    BridgeEvents["TO_FRONT_TIMELINE_LOAD_MARKERS"] = "f:timeline:load-markers";
    BridgeEvents["TO_FRONT_TIMELINE_MARKER"] = "f:timeline:marker";
    // Plugins
    BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_LIST"] = "b:devtools-plugin:list";
    BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_LIST"] = "f:devtools-plugin:list";
    BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_ADD"] = "f:devtools-plugin:add";
    BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED"] = "b:devtools-plugin:setting-updated";
    // Custom inspectors
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_LIST"] = "b:custom-inspector:list";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_LIST"] = "f:custom-inspector:list";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_ADD"] = "f:custom-inspector:add";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_TREE"] = "b:custom-inspector:tree";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_TREE"] = "f:custom-inspector:tree";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_STATE"] = "b:custom-inspector:state";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_STATE"] = "f:custom-inspector:state";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE"] = "b:custom-inspector:edit-state";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_ACTION"] = "b:custom-inspector:action";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_NODE_ACTION"] = "b:custom-inspector:node-action";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE"] = "f:custom-inspector:select-node";
    // Custom state
    BridgeEvents["TO_BACK_CUSTOM_STATE_ACTION"] = "b:custom-state:action";
})(BridgeEvents = exports.BridgeEvents || (exports.BridgeEvents = {}));
var BridgeSubscriptions;
(function (BridgeSubscriptions) {
    BridgeSubscriptions["SELECTED_COMPONENT_DATA"] = "component:selected-data";
    BridgeSubscriptions["COMPONENT_TREE"] = "component:tree";
})(BridgeSubscriptions = exports.BridgeSubscriptions || (exports.BridgeSubscriptions = {}));
var HookEvents;
(function (HookEvents) {
    HookEvents["INIT"] = "init";
    HookEvents["APP_INIT"] = "app:init";
    HookEvents["APP_ADD"] = "app:add";
    HookEvents["APP_UNMOUNT"] = "app:unmount";
    HookEvents["COMPONENT_UPDATED"] = "component:updated";
    HookEvents["COMPONENT_ADDED"] = "component:added";
    HookEvents["COMPONENT_REMOVED"] = "component:removed";
    HookEvents["COMPONENT_EMIT"] = "component:emit";
    HookEvents["COMPONENT_HIGHLIGHT"] = "component:highlight";
    HookEvents["COMPONENT_UNHIGHLIGHT"] = "component:unhighlight";
    HookEvents["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
    HookEvents["TIMELINE_LAYER_ADDED"] = "timeline:layer-added";
    HookEvents["TIMELINE_EVENT_ADDED"] = "timeline:event-added";
    HookEvents["CUSTOM_INSPECTOR_ADD"] = "custom-inspector:add";
    HookEvents["CUSTOM_INSPECTOR_SEND_TREE"] = "custom-inspector:send-tree";
    HookEvents["CUSTOM_INSPECTOR_SEND_STATE"] = "custom-inspector:send-state";
    HookEvents["CUSTOM_INSPECTOR_SELECT_NODE"] = "custom-inspector:select-node";
    HookEvents["PERFORMANCE_START"] = "perf:start";
    HookEvents["PERFORMANCE_END"] = "perf:end";
    HookEvents["PLUGIN_SETTINGS_SET"] = "plugin:settings:set";
    /**
     * @deprecated
     */
    HookEvents["FLUSH"] = "flush";
    /**
     * @deprecated
     */
    HookEvents["TRACK_UPDATE"] = "_track-update";
    /**
     * @deprecated
     */
    HookEvents["FLASH_UPDATE"] = "_flash-update";
})(HookEvents = exports.HookEvents || (exports.HookEvents = {}));
//# sourceMappingURL=consts.js.map