"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEnv = exports.keys = exports.isLinux = exports.isMac = exports.isWindows = exports.isFirefox = exports.isChrome = exports.target = exports.isBrowser = void 0;
exports.isBrowser = typeof navigator !== 'undefined';
exports.target = exports.isBrowser
    ? window
    : typeof global !== 'undefined'
        ? global
        : {};
exports.isChrome = typeof exports.target.chrome !== 'undefined' && !!exports.target.chrome.devtools;
exports.isFirefox = exports.isBrowser && navigator.userAgent.indexOf('Firefox') > -1;
exports.isWindows = exports.isBrowser && navigator.platform.indexOf('Win') === 0;
exports.isMac = exports.isBrowser && navigator.platform === 'MacIntel';
exports.isLinux = exports.isBrowser && navigator.platform.indexOf('Linux') === 0;
exports.keys = {
    ctrl: exports.isMac ? '&#8984;' : 'Ctrl',
    shift: 'Shift',
    alt: exports.isMac ? '&#8997;' : 'Alt',
    del: 'Del',
    enter: 'Enter',
    esc: 'Esc',
};
function initEnv(Vue) {
    if (Vue.prototype.hasOwnProperty('$isChrome'))
        return;
    Object.defineProperties(Vue.prototype, {
        $isChrome: { get: () => exports.isChrome },
        $isFirefox: { get: () => exports.isFirefox },
        $isWindows: { get: () => exports.isWindows },
        $isMac: { get: () => exports.isMac },
        $isLinux: { get: () => exports.isLinux },
        $keys: { get: () => exports.keys },
    });
    if (exports.isWindows)
        document.body.classList.add('platform-windows');
    if (exports.isMac)
        document.body.classList.add('platform-mac');
    if (exports.isLinux)
        document.body.classList.add('platform-linux');
}
exports.initEnv = initEnv;
//# sourceMappingURL=env.js.map