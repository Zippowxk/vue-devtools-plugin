"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubscribed = exports.unsubscribe = exports.subscribe = void 0;
const activeSubs = new Map();
function getSubs(type) {
    let subs = activeSubs.get(type);
    if (!subs) {
        subs = [];
        activeSubs.set(type, subs);
    }
    return subs;
}
function subscribe(type, payload) {
    const rawPayload = JSON.stringify(payload);
    getSubs(type).push({
        payload,
        rawPayload
    });
}
exports.subscribe = subscribe;
function unsubscribe(type, payload) {
    const rawPayload = JSON.stringify(payload);
    const subs = getSubs(type);
    const index = subs.findIndex(sub => sub.rawPayload === rawPayload);
    if (index !== -1) {
        subs.splice(index, 1);
    }
}
exports.unsubscribe = unsubscribe;
function isSubscribed(type, predicate = () => true) {
    return getSubs(type).some(predicate);
}
exports.isSubscribed = isSubscribed;
//# sourceMappingURL=subscriptions.js.map