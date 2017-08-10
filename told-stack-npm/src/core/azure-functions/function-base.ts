import { QueueBinding, TableBinding, HttpFunctionResponse, HttpFunctionRequest, Binding, BindingFull, bindingNameToType, HttpBinding } from "../types/functions";

// Context Types
export type DoneVoid = { __type: 'DoneVoid' };
export type JsonString<T> = string & { __type: 'JsonString' };
export type Public<T> = {[K in keyof T]: T[K]; };

type Context<TBindings, TBindingData={}> = {
    log: typeof console.log,
    done: (error?: any) => DoneVoid,
    bindingData: TBindingData,
    bindings: TBindings;
};

type Context_Http<TBindings, TResponseBody, TBindingData={}> = Context<TBindings, TBindingData> & {
    res: HttpFunctionResponse<TResponseBody>;
};

// Function Definition
export const HTTP_BINDING = '__http';

export type FunctionDefinitionConstructor = new (config: any) => FunctionDefinitionBase;

export class FunctionDefinitionBase {

}

export class FunctionDefinitionBase_Http {
    constructor(httpBinding: HttpBinding) {
        (this as any)[HTTP_BINDING] = httpBinding;
    }
}

// Function Runtime
export type FunctionBaseConstructor = new (config: any) => FunctionBaseUntyped;

abstract class FunctionBaseUntyped {
    abstract run: (context: any, req: any) => Promise<DoneVoid>;
}

export abstract class FunctionBase<TDefinition extends FunctionDefinitionBase> extends FunctionBaseUntyped {
    buildRun(inner: (context: Context<TDefinition>) => Promise<DoneVoid>) {
        return inner;
    }
}

export abstract class FunctionBase_Http<TDefinition extends FunctionDefinitionBase_Http> extends FunctionBaseUntyped {
    buildRun<TResponseBody, TRequestBody extends string = string, TBindingData={}, TQuery={}>(inner: (
        context: Context_Http<TDefinition, TResponseBody, TBindingData>,
        req: HttpFunctionRequest<TRequestBody, TQuery>
    ) => Promise<DoneVoid>) {
        return inner;
    }
}

export abstract class FunctionExtension<TDefinition extends FunctionDefinitionBase> {

    buildMethod<TReturn, TArgs={}>(inner: (context: Context<Public<TDefinition>>, args?: TArgs) => TReturn) {
        return inner;
    }
}

// Binding
function createTrigger<T>(trigger: T): T {
    const t = { ...trigger as any };

    for (let k in t) {
        t[k] = `{${k}}`;
    }

    return t;
}

export type BindingInstanceBase<T> = T & { __definition?: Binding; }

export function createQueueBinding<T, TTrigger={}>(queueBinding: (trigger: TTrigger) => QueueBinding, trigger: TTrigger = null): BindingInstanceBase<T> {
    const t = createTrigger(trigger);
    return {
        __definition: queueBinding(t)
    } as BindingInstanceBase<{}> as any;
}

export function createTableBinding<T, TTrigger={}>(tableBinding: (trigger: TTrigger) => TableBinding, trigger: TTrigger = null): BindingInstanceBase<T> {
    const t = createTrigger(trigger);
    return {
        __definition: tableBinding(t)
    } as BindingInstanceBase<{}> as any;
}
