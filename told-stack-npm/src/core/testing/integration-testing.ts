import { TableBinding, BlobBinding } from "../types/functions";

export type Assert = <T> (name: string, actual: T, expected?: T) => boolean;
export type LoadStorage = <TExpected> (actual: TableBinding | BlobBinding) => Promise<TExpected>;
export type ApiFetch = <TResponse, TBody={}, TQuery={}> (apiRoute: string, options?: { body: TBody }) => Promise<TResponse>;


export type TestResult = { result: 'pass' | 'fail', message?: string };
export interface TestContext {
    assert: Assert;
    load: LoadStorage;
    apiFetch: ApiFetch;
    notifyFailure: () => void;
    getResult: () => TestResult;
};

export function createTest<TConfigs>(create: (configs: TConfigs) => {
    name: string,
    run: (testContext: TestContext) => Promise<void>
}) {
    return (testContext: TestContext, configs: TConfigs) => {
        const { name, run } = create(configs);

        return {
            name,
            run: () => {
                return run(testContext);
            }
        };
    };
}
