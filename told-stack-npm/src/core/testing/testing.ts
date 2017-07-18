
import { HttpFunctionResponse, HttpFunctionRequest } from "../types/functions";

export function createTester<T>(test: (name: string, run: () => void) => void, createFixture: () => T) {

    const it = (subject: string, run: (fixture: T) => void) => {
        console.log(`IT: ${subject}`);
        // test(subject, () => run(createFixture()));
        run(createFixture());
    }

    const should = (goal: string, run: (fixture: T) => void) => {
        console.log(`SHOULD: ${goal}`);
        test(goal, () => run(createFixture()));
    }


    return {
        it,
        should,
    };
}

export interface HttpContextType<TResponse, TBindingData, TBindings> {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse<TResponse>,
    bindingData: TBindingData,
    bindings: TBindings
};

// export class HttpContext<TResponse, TBindingData, TBindings> implements HttpContextType<TResponse, TBindingData, TBindings> {

//     constructor(
//         public done: () => void,
//         public setRes: (v: HttpFunctionResponse<TResponse>) => void,
//         public log = console.log.bind(console),
//     ) {}

//     set res(v: HttpFunctionResponse<TResponse>) {
//         this.setRes(v);
//     }

//     bindingData: TBindingData;
//     bindings: TBindings;
// }

export type Getter<T> = { getter: () => T };
export type Setter<T> = { setter: (value: T) => void };
export type GetterSetter<T> = Getter<T> & Setter<T>;
export type GetterOrSetter<T> = GetterSetter<T> | Getter<T> | Setter<T>;

export type GettersObject<T> = {
    [P in keyof T]: Getter<T[P]>;
};

export type GetterSettersObject<T> = {
    [P in keyof T]: GetterOrSetter<T[P]>;
};

export function injectGetterSetters<TObj, TProp>(onGetSet: () => void, obj: TObj, getterSettersObj: GetterSettersObject<TProp>): TObj & TProp {
    for (let k in getterSettersObj) {
        const gs = getterSettersObj[k] as GetterSetter<any>;
        Object.defineProperty(obj, k, {
            get: function () {
                onGetSet();
                return gs.getter ? gs.getter() : this['_' + k];
            },
            set: function (v) {
                onGetSet();
                if (!gs.setter) { throw `No Setter Defined for '${k}'`; }
                gs.setter(this['_' + k] = v);
            },
        });
    }

    return obj as TObj & TProp;
}

export function injectStart<T>(onGetSet: () => void, obj: T) {
    return {
        inject: <TProp>(getterSettersObj: GetterSettersObject<TProp>) => injectStart(onGetSet, injectGetterSetters(onGetSet, obj, getterSettersObj)),
        end: () => obj,
    };
}

export type RunFunction_Http<TConfig, TResponse, TBindings, TBindingData, TBody, TQuery> = (
    config: TConfig,
    context: HttpContextType<TResponse, TBindingData, TBindings>,
    req: HttpFunctionRequest<TBody, TQuery>) => void;


export function mockHttp<TConfig, TResponse={}, TBindings={}, TBindingData={}, TBody={}, TQuery={}>(
    runFunction: RunFunction_Http<TConfig, TResponse, TBindings, TBindingData, TBody, TQuery>
) {
    // console.log('mockHttp START');
    return (
        mocks: {
            onLog?: typeof console.log,
            config: GettersObject<TConfig>,
            res?: Setter<HttpFunctionResponse<TResponse>>,
            bindings?: GetterSettersObject<TBindings>,
            bindingData?: GettersObject<TBindingData>,
            req_body_query?: GettersObject<{ body?: TBody, query?: TQuery }>,
            req_headers?: GettersObject<any>,
        }
    ) => {

        let isDone = false;
        const onGetSet = () => {
            if (isDone) {
                throw 'Invalid Operation: context.done() must be the final operation';
            }
        };

        const done = () => {
            // Future commands should cause Test Failure
            isDone = true;
        };

        const config = injectGetterSetters(onGetSet, {}, mocks.config as GetterSettersObject<TConfig>);

        const context_01 = {
            log: mocks.onLog,
            done,
            bindings: injectGetterSetters(onGetSet, {}, mocks.bindings),
            bindingData: injectGetterSetters(onGetSet, {}, mocks.bindingData as GetterSettersObject<TBindingData>),
        };

        const context: HttpContextType<TResponse, TBindingData, TBindings> =
            injectStart(onGetSet, context_01)
                .inject({ res: mocks.res } as GetterSettersObject<{ res: HttpFunctionResponse<TResponse> }>)
                .end();

        const req: HttpFunctionRequest<TBody, TQuery> = injectStart(onGetSet, {
            headers: injectGetterSetters(onGetSet, {}, mocks.req_headers) as GetterSettersObject<any>,
        })
            .inject(mocks.req_body_query as GetterSettersObject<{ body: TBody, query: TQuery }>)
            .end();

        return runFunction(config, context, req);
    };
}
