import { FunctionDefinitionConstructor, FunctionBaseConstructor } from "../core/azure-functions/function-base";

export interface EntryInfo {
    name: string;
    import: string;
    configImport: string;
    configName?: string;
    type?: undefined | 'function-base';
}

export interface EntryInfoResolved_FunctionBuilder extends EntryInfo {
    type: undefined;
    import_required: {
        createFunctionJson: (config: any) => string;
        runFunction: (config: any, ...args: any[]) => void;
    };
    configImport_required: { configNamed: any };
}

export interface EntryInfoResolved_FunctionBase extends EntryInfo {
    type: 'function-base';
    import_required: {
        FunctionDefinition: FunctionDefinitionConstructor;
        Function: FunctionBaseConstructor;
    };
     configImport_required: { configNamed: any };
}

export type EntryInfoResolved = EntryInfoResolved_FunctionBuilder | EntryInfoResolved_FunctionBase;

export function isEntryInfoFunctionBase(x: EntryInfoResolved): x is EntryInfoResolved_FunctionBase {
    return (x.type === 'function-base');
}