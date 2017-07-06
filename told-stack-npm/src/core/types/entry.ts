export interface EntryInfo {
    name: string;
    import: string;
    configImport: string;
}

export interface EntryInfoResolved extends EntryInfo {
    import_required: { createFunctionJson: (config: any) => string, runFunction: (config: any, ...args: any[]) => void };
    configImport_required: { config: any };
}