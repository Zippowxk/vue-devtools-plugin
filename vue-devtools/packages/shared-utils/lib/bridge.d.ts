/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Bridge extends EventEmitter {
    wall: any;
    _batchingQueue: any[];
    _sendingQueue: any[][];
    _receivingQueue: any[];
    _sending: boolean;
    _timer: NodeJS.Timeout;
    constructor(wall: any);
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    send(event: string, payload?: any): void;
    /**
     * Log a message to the devtools background page.
     */
    log(message: string): void;
    _flush(): void;
    _emit(message: any): void;
    _send(messages: any): void;
    _nextSend(): void;
}
