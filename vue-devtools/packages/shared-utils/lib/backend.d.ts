export declare const backendInjections: {
    instanceMap: Map<any, any>;
    isVueInstance: (value: any) => boolean;
    getCustomInstanceDetails: (instance: any) => any;
};
export declare function getInstanceMap(): Map<any, any>;
export declare function getCustomInstanceDetails(instance: any): any;
export declare function isVueInstance(value: any): boolean;
export declare function getCustomRouterDetails(router: any): {
    _custom: {
        type: string;
        display: string;
        value: {
            options: any;
            currentRoute: any;
        };
        fields: {
            abstract: boolean;
        };
    };
};
export declare function getCustomStoreDetails(store: any): {
    _custom: {
        type: string;
        display: string;
        value: {
            state: any;
            getters: {};
        };
        fields: {
            abstract: boolean;
        };
    };
};
export declare function getCatchedGetters(store: any): {};
