interface Entry {
    name: string;
    import: string;
    configImport: string;
}

interface EntryRequired extends Entry {
    import_required: { createFunctionJson: (config: any) => string, runFunction: (config: any, ...args: any[]) => void };
    configImport_required: { config: any };
}