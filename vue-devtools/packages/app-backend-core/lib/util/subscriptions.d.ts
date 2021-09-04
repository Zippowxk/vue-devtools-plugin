interface Subscription {
    payload: any;
    rawPayload: string;
}
export declare function subscribe(type: string, payload: any): void;
export declare function unsubscribe(type: string, payload: any): void;
export declare function isSubscribed(type: string, predicate?: (sub: Subscription) => boolean): boolean;
export {};
