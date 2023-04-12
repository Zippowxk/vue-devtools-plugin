"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raf = void 0;
let pendingCallbacks = [];
/**
 * requestAnimationFrame that also works on non-browser environments like Node.
 */
exports.raf = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (fn) => {
        if (!pendingCallbacks.length) {
            setImmediate(() => {
                const now = performance.now();
                const cbs = pendingCallbacks;
                // in case cbs add new callbacks
                pendingCallbacks = [];
                cbs.forEach(cb => cb(now));
            });
        }
        pendingCallbacks.push(fn);
    };
//# sourceMappingURL=raf.js.map