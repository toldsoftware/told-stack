import { EntryInfo } from "@told/stack/src/core/types/entry";

declare const require: any;
export const requireCallback = (p: string) => require(p);

export const testEntries: EntryInfo[] = [
    { name: 'all-tests', import: '@told/stack/src/core/tester/server/tester', configImport: './tests/all-tests' },
];
