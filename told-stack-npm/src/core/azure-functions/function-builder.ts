import { HttpFunctionResponse, HttpFunctionRequest, QueueBinding, TableBinding, BlobBinding, AnyBinding } from '../types/functions';

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

    // // Extend
    // trigger<TBindingDataExt>(bindingData?: TBindingDataExt): FunctionBuilder<TBindings, TBindingData & TBindingDataExt, TContextExt, TBuildExt> {
    //     // Don't do anything
    //     return this as any;
    // }

    bindings<TBindingsExt>(getBindings: (bindingData: TBindingData) => TBindingsExt): FunctionBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt> {

        const bindings = getBindings(this._bindingData_trigger);

        // Add Bindings
        for (let k in bindings) {
            this._bindings[k] = bindings[k];
        }

        return this as any;
    }

    // bindingsAuto1<TBindingsExt extends { [name: string]: (t: TBindingData) => AnyBinding }>(bindings: TBindingsExt): FunctionBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt> {

    //     // Add Bindings
    //     for (let k in bindings) {
    //         this._bindings[k] = bindings[k];
    //     }

    //     return this as any;
    // }

    bindingsAuto<TBindingsExt>(getBindings: (t: TBindingData) => TBindingsExt): FunctionBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt> {
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

    // bindingsAuto3<TBindingsExt extends { [name: string]: (t: TBindingData) => AnyBinding }>(bindings: TBindingsExt): FunctionBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt> {

    //     // Add Bindings
    //     for (let k in bindings) {
    //         this._bindings[k] = bindings[k];

    //         // Use name to set direction
    //         if (k.match('^in')) {
    //             (this._bindings[k] as any).direction = 'in';
    //         } else if (k.match('^out')) {
    //             (this._bindings[k] as any).direction = 'out';
    //         }
    //     }


    //     return this as any;
    // }

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

export function buildHttpFunction<TBindingData, TRequestQuery = {}, TRequestBody = string, TResponseBody = {}>(options: { route: string })
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

    const b = new FunctionBuilder({});
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

export function buildFunction_common<TBindingData>(bindingData: TBindingData) {
    return new FunctionBuilder<{}, TBindingData>(bindingData);
}

// export function buildFunction_trigger<TBindingData, TBinding>(bindingData: TBindingData, binding:TBinding) {
//     return new FunctionBuilder<TBinding, TBindingData>(bindingData);
// }

// export function buildQueueTriggerFunction<TQueue>(options: { queueName: string, connection: string }) {

//     const name = Object.getOwnPropertyNames(binding)[0];

//     const b = new FunctionBuilder();
//     const b2 = b.bindings({
//         [name]: {
//             type: 'queueTrigger',
//             direction: 'in',
//             ...(binding as any),
//         },
//     });

//     return b2 as any;
// }


export function buildBinding<TBinding>(binding: AnyBinding): TBinding {
    return binding as any;
}

export function buildQueueTrigger<TContent>(options: { queueName: string, connection: string }): BindingDefinition<TContent> {
    return {
        type: 'queueTrigger',
        direction: 'in',
        queueName: options.queueName,
        connection: options.connection
    } as any;
}

export function buildQueue<TContent>(options: { direction: 'in' | 'out', queueName: string, connection: string }): BindingDefinition<TContent> {
    // {
    //     name: 'outProcessQueue',
    //     type: 'queue',
    //     direction: 'out',
    //     queueName: config.processQueue_queueName,
    //     connection: config.storageConnection
    // },

    return {
        type: 'queue',
        direction: options.direction,
        queueName: options.queueName,
        connection: options.connection
    } as any;

}


export function buildTable<TContent>(options: { direction: 'in' | 'out', tableName: string, partitionKey?: string, rowKey?: string, connection: string }): BindingDefinition<TContent> {
    //     name: 'outStripeCheckoutTable',
    //     type: 'table',
    //     direction: 'out',
    //     tableName: config.stripeCheckoutTable_tableName,
    //     connection: config.storageConnection

    return {
        type: 'table',
        direction: options.direction,
        tableName: options.tableName,
        partitionKey: options.partitionKey,
        rowKey: options.rowKey,
        connection: options.connection
    } as any;

}


// export type FunctionJsonBuilder<TBindings={}, TBindingData={}, TContextExt={}, TBuildExt={}> = {
//     // Extend
//     bindings<TBindingsExt>(bindings: TBindingsExt): FunctionJsonBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt>;

//     // Functions Json
//     _functionJson(): string;

//     // Runtime
//     _build(): {
//         context: {
//             log: typeof console.log,
//             done: () => void,
//             bindingData: TBindingData,
//             bindings: TBindings;
//         } & TContextExt;
//     } & TBuildExt;
// };


// export function createFunctionJson(config: FunctionTemplateConfig) {
//     return {
//         bindings: [
//             {
//                 name: 'req',
//                 type: 'httpTrigger',
//                 direction: 'in',
//                 authLevel: 'anonymous',
//                 route: config.submit_route
//             },
//             {
//                 name: 'res',
//                 type: 'http',
//                 direction: 'out'
//             },
//             {
//                 name: 'outProcessQueue',
//                 type: 'queue',
//                 direction: 'out',
//                 queueName: config.processQueue_queueName,
//                 connection: config.storageConnection
//             },
//             // {
//             //     name: 'outStripeCheckoutTable',
//             //     type: 'table',
//             //     direction: 'out',
//             //     tableName: config.stripeCheckoutTable_tableName,
//             //     connection: config.storageConnection
//             // },
//         ],
//         disabled: false
//     };
// }




// type FunctionJsonContext<TContextExt, TBindings> = {
//     context: {
//         // Extend
//         out<TBindingsExt>({ }): FunctionJsonContext<TContextExt, TBindings & TBindingsExt>;

//         bindings: TBindings;
//     } & TContextExt;
// };

// Example
// export function createFunctionJson2(config: FunctionTemplateConfig) {
//     return createHttpFunction({ route: config.submit_route })
//         .bindings({
//             outProcessQueue: createQueue<ProcessQueue>({ queueName: config.processQueue_queueName })
//         })
//         ;
// }


// // // Get Types: Option 1
// // function convertFunctionJsonBuilderToContext<T>(cf: (config: any) => { _build(): { context: T } }): T {
// //     return null as any;
// // }

// // function convertFunctionJsonBuilderToReq<T>(cf: (config: any) => { _build(): { req: T } }): T {
// //     return null as any;
// // }
// // const tContext = convertFunctionJsonBuilderToContext(createFunctionJson2);
// // type TContext = typeof tContext;
// // const tReq = convertFunctionJsonBuilderToReq(createFunctionJson2);
// // type TReq = typeof tReq;

// // export async function runFunction2(config: ServerConfigType, context: TContext, req: TReq) {
// //     // context.res ={
// //     //     isRaw:true,
// //     //     body: {

// //     //     },
// //     //     status:200,
// //     // };
// // }

// // Get Typs: Option 2 WIN!
// export function createFunctionJson2(config: FunctionTemplateConfig) {
//     return createHttpFunction({ route: config.submit_route })
//         .bindings({
//             outProcessQueue: createQueue<ProcessQueue>({ queueName: config.processQueue_queueName })
//         })
//         ;
// }

// function createRunFunction<TConfig, TContext, TReq>(
//     cf: (config: any) => { _build(): { context: TContext, req: TReq } },
//     runFunction: (config: TConfig, context: TContext, req: TReq) => void | Promise<void>
// ) {
//     return runFunction;
// }

// // Inside
// export const runFunction2B = createRunFunction(createFunctionJson2, (config: ServerConfigType, context, req) => {
// });

// // For Compat:
// function create_createFunctionJson<TConfig>(config: TConfig, cf: (config: any) => { _functionJson(): string }) {
//     return cf(config)._functionJson;
// }

// export const createFunctionJsonB = (config: FunctionTemplateConfig) => create_createFunctionJson(config, createFunctionJson2);

// // export async function runFunction2B<TContext, TReq>(cf: typeof createFunctionJson2, config: ServerConfigType, context: TContext, req: TReq) {
// //     // context.res ={
// //     //     isRaw:true,
// //     //     body: {

// //     //     },
// //     //     status:200,
// //     // };
// // }