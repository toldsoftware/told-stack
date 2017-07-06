import { EntryInfo } from "@told/stack/lib/core/types/entry";

export const requireCallback = (p: string) => require(p);

export const entries: EntryInfo[] = [
    { name: 'lookup-lsc-01-http', import: '@told/stack/lib/data-pattern-lookup-lsc/src-server/function-01-http', configImport: './config-lookup-lsc' },
    { name: 'lookup-lsc-02-update-request-queue', import: '@told/stack/lib/data-pattern-lookup-lsc/src-server/function-02-update-request-queue', configImport: './config-lookup-lsc' },
    { name: 'lookup-lsc-03-update-execute-queue', import: '@told/stack/lib/data-pattern-lookup-lsc/src-server/function-03-update-execute-queue', configImport: './config-lookup-lsc' },

    { name: 'test-blob-lookup-lsc-01-http', import: '@told/stack/lib/data-pattern-lookup-lsc/src-server/function-01-http', configImport: './config-test-blob' },
    { name: 'test-blob-lookup-lsc-02-update-request-queue', import: '@told/stack/lib/data-pattern-lookup-lsc/src-server/function-02-update-request-queue', configImport: './config-test-blob' },
    { name: 'test-blob-lookup-lsc-03-update-execute-queue', import: '@told/stack/lib/data-pattern-lookup-lsc/src-server/function-03-update-execute-queue', configImport: './config-test-blob' },
];