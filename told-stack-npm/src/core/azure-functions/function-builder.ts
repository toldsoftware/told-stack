import { HttpFunctionResponse, HttpFunctionRequest } from "../types/functions";

export type RuntimeTypesBuilder<TContext, TReq> = {
    build_runtimeTypes(): { context: TContext, req: TReq };
}

export type FunctionJsonBuilder = {
    build_functionJson(): { bindings: any[] };
}

export function build_createFunctionJson<TConfig>(config: TConfig, cf: (config: any) => FunctionJsonBuilder) {
    return cf(config).build_functionJson();
}

export function build_runFunction<TConfig, TContext, TReq>(
    cf: (config: any) => RuntimeTypesBuilder<TContext, TReq>,
    runFunction: (config: TConfig, context: TContext, req: TReq) => void | Promise<void>
) {
    return runFunction;
}

export class FunctionBuilder<TBindings={}, TBindingData={}, TContextExt={}, TBuildExt={}> {
    private _bindings: { [name: string]: any } = {};

    // Extend
    bindings<TBindingsExt>(bindings: TBindingsExt): FunctionBuilder<TBindings & TBindingsExt, TBindingData, TContextExt, TBuildExt> {

        // Add Bindings
        for (let k in bindings) {
            this._bindings[k] = bindings[k];
        }

        return this as any;
    }

    // Functions Json
    build_functionJson(): { bindings: any[] } {
        // return {
        //     bindings: [
        //         {
        //             name: "req",
        //             type: "httpTrigger",
        //             direction: "in",
        //             authLevel: "anonymous",
        //             route: config.submit_route
        //         },
        //         {
        //             name: "res",
        //             type: "http",
        //             direction: "out"
        //         },
        //         {
        //             name: "outProcessQueue",

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
            done: () => void,
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
    //     name: "req",
    //     type: "httpTrigger",
    //     direction: "in",
    //     authLevel: "anonymous",
    //     route: config.submit_route
    // },
    // {
    //     name: "res",
    //     type: "http",
    //     direction: "out"
    // },

    const b = new FunctionBuilder();
    const b2 = b.bindings({
        req: {
            type: "httpTrigger",
            direction: "in",
            authLevel: "anonymous",
            route: options.route,
        },
        res: {
            type: "http",
            direction: "out"
        }
    });

    return b2 as any;
}

export function buildQueue<TContent>(options: { direction: 'in' | 'out', queueName: string, storageConnection: string }): BindingDefinition<TContent> {
    // {
    //     name: "outProcessQueue",
    //     type: "queue",
    //     direction: "out",
    //     queueName: config.processQueue_queueName,
    //     connection: config.storageConnection
    // },

    return {
        type: "queue",
        direction: options.direction,
        queueName: options.queueName,
        connection: options.storageConnection
    } as any;

}


export function buildTable<TContent>(options: { direction: 'in' | 'out', tableName: string, partitionKey?: string, rowKey?: string, storageConnection: string }): BindingDefinition<TContent> {
    //     name: "outStripeCheckoutTable",
    //     type: "table",
    //     direction: "out",
    //     tableName: config.stripeCheckoutTable_tableName,
    //     connection: config.storageConnection

    return {
        type: "table",
        direction: options.direction,
        tableName: options.tableName,
        partitionKey: options.partitionKey,
        rowKey: options.rowKey,
        connection: options.storageConnection
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
//                 name: "req",
//                 type: "httpTrigger",
//                 direction: "in",
//                 authLevel: "anonymous",
//                 route: config.submit_route
//             },
//             {
//                 name: "res",
//                 type: "http",
//                 direction: "out"
//             },
//             {
//                 name: "outProcessQueue",
//                 type: "queue",
//                 direction: "out",
//                 queueName: config.processQueue_queueName,
//                 connection: config.storageConnection
//             },
//             // {
//             //     name: "outStripeCheckoutTable",
//             //     type: "table",
//             //     direction: "out",
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