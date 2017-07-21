import { EntryInfo } from "../core/types/entry";

export function webpack_generateEntry(rootDirName: string,
    entries: EntryInfo[], destDir = '_deploy', intermediateDir = '_intermediate',
    tests: EntryInfo[] = [], testDir = '_deploy_tests', intermediateTestsDir = '_intermediate_tests',
) {

    const entryPathNames = [
        ...entries.map(x => ({
            path: `${rootDirName}/${intermediateDir}/entries/${x.name}.ts`,
            name: x.name,
            isTest: false
        })),
        ...tests.map(x => ({
            path: `${rootDirName}/${intermediateTestsDir}/entries/${x.name}.ts`,
            name: x.name,
            isTest: true
        })),
    ];

    console.log('Webpack', { entryPathNames });

    const entry: { [key: string]: string } = {
        // './_post-build/post-build.js': `${rootDirName}/config/post-build.ts`,
    };

    entryPathNames.forEach(x => {
        if (!x.isTest) {
            entry[`./${destDir}/${x.name}/bundle.js`] = x.path;
        } else {
            entry[`./${testDir}/${x.name}/bundle.js`] = x.path;
        }
    });
    return entry;
}