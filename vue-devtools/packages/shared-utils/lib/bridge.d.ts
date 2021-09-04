/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Bridge extends EventEmitter {
    wall: any;
    _batchingQueue: any[];
    _sendingQueue: any[][];
    _receivingQueue: any[];
    _sending: boolean;
    _time: number;
    _timer: NodeJS.Timeout;
    constructor(wall: any);
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
