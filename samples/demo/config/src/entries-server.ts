import { EntryInfo } from "@told/stack/src/core/types/entry";

declare const require : any;
export const requireCallback = (p: string) => require(p);

export const entries: EntryInfo[] = [
    { name: 'http-static', import: '@told/stack/src/core/static/server/function-01-http', configImport: './core/static-server' },
    
    { name: 'logger-01-http', import: '@told/stack/src/core/logger/server/function-01-http', configImport: './core/logger-server' },
    { name: 'logger-02-queue-to-table', import: '@told/stack/src/core/logger/server/function-02-queue-to-table', configImport: './core/logger-server' },
    
    { name: 'http-echo', import: '@told/stack/src/tools/http-echo/src-server/function-01-http', configImport: './http/http-echo' },

    { name: 'http-early-response', import: '@told/stack/src/data-patterns/experiments/http-early-response/src-server/function-01-http', configImport: './http/http-early-response' },

    { name: 'http-to-queue', import: '@told/stack/src/data-patterns/http-to-queue/src-server/function-01-http', configImport: './http/http-to-queue' },
    { name: 'http-to-blob', import: '@told/stack/src/data-patterns/http-to-blob/src-server/function-01-http', configImport: './http/http-to-blob' },
    { name: 'http-to-table', import: '@told/stack/src/data-patterns/http-to-table/src-server/function-01-http', configImport: './http/http-to-table' },
    { name: 'http-to-table-sdk', import: '@told/stack/src/data-patterns/http-to-table-sdk/src-server/function-01-http', configImport: './http/http-to-table-sdk' },

    { name: 'http-input-blob', import: '@told/stack/src/data-patterns/http-input-blob/src-server/function-01-http', configImport: './http/http-input-blob' },
    { name: 'http-input-blob-sdk', import: '@told/stack/src/data-patterns/http-input-blob-sdk/src-server/function-01-http', configImport: './http/http-input-blob-sdk' },
    { name: 'http-input-table', import: '@told/stack/src/data-patterns/http-input-table/src-server/function-01-http', configImport: './http/http-input-table' },

    { name: 'lookup-lsc-01-http', import: '@told/stack/src/data-patterns/lookup-lsc/src-server/function-01-http', configImport: './lookup-lsc/server' },
    { name: 'lookup-lsc-02-update-request-queue', import: '@told/stack/src/data-patterns/lookup-lsc/src-server/function-02-update-request-queue', configImport: './lookup-lsc/server' },
    { name: 'lookup-lsc-03-update-execute-queue', import: '@told/stack/src/data-patterns/lookup-lsc/src-server/function-03-update-execute-queue', configImport: './lookup-lsc/server' },
    { name: 'lookup-lsc-04-http-download-blob', import: '@told/stack/src/data-patterns/lookup-lsc/src-server/function-04-http-download-blob', configImport: './lookup-lsc/server' },
    
];