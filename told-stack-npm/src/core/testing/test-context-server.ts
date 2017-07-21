import { TestContext } from './integration-testing';
import { TableBinding, BlobBinding } from "../types/functions";
import { fetchTyped } from "../utils/fetch-typed-server";
import { partialDeepCompare } from "../utils/objects";
import { loadEntity_parse } from "../utils/azure-storage-sdk/tables";
import { readBlob } from "../utils/azure-storage-sdk/blobs";

export class TestContext_Server implements TestContext {

    constructor(private config: {
        rootUrl: string,
        log: typeof console.log,
    }) { }

    apiFetch = async <TResponse, TBody = {}>(apiRoute: string, options?: { body: TBody; }): Promise<TResponse> => {
        // TODO: Handle Query

        const url = `${this.config.rootUrl.replace(/\/$/, '')}/${apiRoute.replace(/^\//, '')}`;

        try {
            const result = await fetchTyped<TResponse, TBody>(url, options);
            this.config.log(' apiFetch', { url, options, result });
            return result;
        } catch (err) {
            this.config.log(' apiFetch', { url, options, err });
            throw err;
        }
    }

    assert = <T>(name: string, actual: T, expected?: T): boolean => {
        const isExpected = (!expected && actual) || (expected && partialDeepCompare(actual, expected));
        if (isExpected) {
            this.config.log(`  OK - ${name}`);
            return true;
        } else {
            this.config.log(`! FAIL - ${name}`, { actual, expected });
            return false;
        }
    }

    load = async <TExpected>(binding: TableBinding | BlobBinding): Promise<TExpected> => {
        if (isTableBinding(binding)) {
            return await loadEntity_parse<TExpected>(binding.tableName, binding.partitionKey, binding.rowKey) ;
        } else {
            const container = binding.path.substr(0, binding.path.indexOf('/'));
            const blob = binding.path.substr(binding.path.indexOf('/') + 1);
            return await readBlob(container, blob) as any as TExpected;
        }
    }
}

function isTableBinding(binding: TableBinding | BlobBinding): binding is TableBinding {
    return (binding as TableBinding).tableName !== undefined;
}