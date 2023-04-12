export interface PageConfig {
    openInEditorHost?: string;
    defaultSelectedAppId?: string;
    customVue2ScanSelector?: string;
}
export declare function getPageConfig(): PageConfig;
export declare function initOnPageConfig(): void;
