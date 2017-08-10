import { HttpFunctionResponse, HttpFunctionRequest, QueueBinding, TableBinding, BlobBinding, AnyBinding, SendGridBinding, SendGridMessage } from '../types/functions';

export function createTrigger<T>(trigger: T): T {
    const t = { ...trigger as any };

    for (let k in t) {
        t[k] = `{${k}}`;
    }

    return t;
}

export type RuntimeTypesBuilder_Http<TContext, TReq> = {
    build_runtimeTypes(): { context: TContext, req: TReq };
}

export type RuntimeTypesBuilder_Common<TContext> = {
    build_runtimeTypes(): { context: TContext };
}

export type FunctionJsonBuilder = {
    build_functionJson(): { bindings: any[] };
}

export function build_createFunctionJson<TConfig>(config: TConfig, cf: (config: any) => FunctionJsonBuilder) {
    return cf(config).build_functionJson();
}

export function build_runFunction_http<TConfig, TContext, TReq=undefined>(
    cf: (config: any) => RuntimeTypesBuilder_Http<TContext, TReq>,
    runFunction: (config: TConfig, context: TContext, req: TReq) => void | Promise<void>
) {
    return runFunction;
}

export function build_runFunction_common<TConfig, TContext>(
    cf: (config: any) => RuntimeTypesBuilder_Common<TContext>,
    runFunction: (config: TConfig, context: TContext) => void | Promise<void>
) {
    return runFunction;
}

export class FunctionBuilder<TBindings={}, TBindingData={}, TContextExt={}, TBuildExt={}> {
    private _bindingData_trigger: TBindingData;
    private _bindings: { [name: string]: any } = {};

    constructor(bindingData: TBindingData) {
        this._bindingData_trigger = createTrigger(bindingData);
    }

    bindings<TBindingsExt>(getBindings: (t: TBindingData) => TBindingsExt): FunctionBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt> {
        const bindings = getBindings(this._bindingData_trigger);

        // Add Bindings
        for (let k in bindings) {
            this._bindings[k] = bindings[k];

            // Use name to set direction
            if (k.match('^in')) {
                (this._bindings[k] as any).direction = 'in';
            } else if (k.match('^out')) {
                (this._bindings[k] as any).direction = 'out';
            }

            // Use name to set type
            if (k.match('Queue$')) {
                (this._bindings[k] as any).type = 'queue';
            } else if (k.match('Table$')) {
                (this._bindings[k] as any).type = 'table';
            } else if (k.match('Blob$')) {
                (this._bindings[k] as any).type = 'blob';
            } else if (k.match('QueueTrigger$')) {
                (this._bindings[k] as any).type = 'queueTrigger';
            } else if (k.match('TableTrigger$')) {
                (this._bindings[k] as any).type = 'tableTrigger';
            } else if (k.match('BlobTrigger$')) {
                (this._bindings[k] as any).type = 'blobTrigger';
            }
        }


        return this as any;
    }

    // Functions Json
    build_functionJson(): { bindings: any[] } {
        // return {
        //     bindings: [
        //         {
        //             name: 'req',
        //             type: 'httpTrigger',
        //             direction: 'in',
        //             authLevel: 'anonymous',
        //             route: config.submit_route
        //         },
        //         {
        //             name: 'res',
        //             type: 'http',
        //             direction: 'out'
        //         },
        //         {
        //             name: 'outProcessQueue',

        const bObj = this._bindings;
        const b = Object.getOwnPropertyNames(bObj).map(k => {
            const o = bObj[k];
            return {
                name: k,
                ...o
            };
        });

        return {
            bindings: b,
        };
    }

    // Runtime
    build_runtimeTypes(): {
        context: {
            log: typeof console.log,
            done: (error?: any) => void,
            bindingData: TBindingData,
            bindings: TBindings;
        } & TContextExt;
    } & TBuildExt {
        return null as any;
    }
}

export type BindingDefinition<T> = T; // & { _def: any };

export function buildFunction_http<TResponseBody = {}, TBindingData={}, TRequestQuery = {}, TRequestBody = string>(options: { route: string, bindingData?: TBindingData })
    : FunctionBuilder<{}, TBindingData, { res: HttpFunctionResponse<TResponseBody> }, { req: HttpFunctionRequest<TRequestBody> }> {

    // {
    //     name: 'req',
    //     type: 'httpTrigger',
    //     direction: 'in',
    //     authLevel: 'anonymous',
    //     route: config.submit_route
    // },
    // {
    //     name: 'res',
    //     type: 'http',
    //     direction: 'out'
    // },

    const b = new FunctionBuilder(options.bindingData);
    const b2 = b.bindings(t => ({
        req: {
            type: 'httpTrigger',
            direction: 'in',
            authLevel: 'anonymous',
            route: options.route,
        },
        res: {
            type: 'http',
            direction: 'out'
        }
    }));

    return b2 as any;
}

export function buildFunction_common<TBindingData>(bindingData?: TBindingData) {
    return new FunctionBuilder<{}, TBindingData>(bindingData);
}

export function build_binding<TBinding>(binding: AnyBinding): TBinding {
    return binding as any;
}

export function build_binding_sendGrid(binding: SendGridBinding): SendGridMessage {
    return {
        ...binding,
        type: 'sendGrid',
    } as any;
}
