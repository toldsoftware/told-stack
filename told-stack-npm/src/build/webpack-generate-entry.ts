import { EntryInfo } from "../core/types/entry";

export function webpack_generateEntry(rootDirName: string, entries: EntryInfo[], destDir = '_deploy') {
    const entryPathNames = entries.map(x => ({
        path: `${rootDirName}/_intermediate/entries/${x.name}.ts`,
        name: x.name,
    }));

    console.log('Webpack', { entryPathNames });

    const entry: { [key: string]: string } = {
        // './_post-build/post-build.js': `${rootDirName}/config/post-build.ts`,
    };

    entryPathNames.forEach(x => entry[`./${destDir}/${x.name}/bundle.js`] = x.path);
    return entry;
}