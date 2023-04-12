"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
const events_1 = require("events");
const raf_1 = require("./raf");
const BATCH_DURATION = 100;
class Bridge extends events_1.EventEmitter {
    constructor(wall) {
        super();
        this.setMaxListeners(Infinity);
        this.wall = wall;
        wall.listen(messages => {
            if (Array.isArray(messages)) {
                messages.forEach(message => this._emit(message));
            }
            else {
                this._emit(messages);
            }
        });
        this._batchingQueue = [];
        this._sendingQueue = [];
        this._receivingQueue = [];
        this._sending = false;
    }
    on(event, listener) {
        const wrappedListener = async (...args) => {
            try {
                await listener(...args);
            }
            catch (e) {
                console.error(`[Bridge] Error in listener for event ${event.toString()} with args:`, args);
                console.error(e);
            }
        };
        return super.on(event, wrappedListener);
    }
    send(event, payload) {
        this._batchingQueue.push({
            event,
            payload,
        });
        if (this._timer == null) {
            this._timer = setTimeout(() => this._flush(), BATCH_DURATION);
        }
    }
    /**
     * Log a message to the devtools background page.
     */
    log(message) {
        this.send('log', message);
    }
    _flush() {
        if (this._batchingQueue.length)
            this._send(this._batchingQueue);
        clearTimeout(this._timer);
        this._timer = null;
        this._batchingQueue = [];
    }
    // @TODO types
    _emit(message) {
        if (typeof message === 'string') {
            this.emit(message);
        }
        else if (message._chunk) {
            this._receivingQueue.push(message._chunk);
            if (message.last) {
                this.emit(message.event, this._receivingQueue);
                this._receivingQueue = [];
            }
        }
        else if (message.event) {
            this.emit(message.event, message.payload);
        }
    }
    // @TODO types
    _send(messages) {
        this._sendingQueue.push(messages);
        this._nextSend();
    }
    _nextSend() {
        if (!this._sendingQueue.length || this._sending)
            return;
        this._sending = true;
        const messages = this._sendingQueue.shift();
        try {
            this.wall.send(messages);
        }
        catch (err) {
            if (err.message === 'Message length exceeded maximum allowed length.') {
                this._sendingQueue.splice(0, 0, messages.map(message => [message]));
            }
        }
        this._sending = false;
        (0, raf_1.raf)(() => this._nextSend());
    }
}
exports.Bridge = Bridge;
//# sourceMappingURL=bridge.js.map