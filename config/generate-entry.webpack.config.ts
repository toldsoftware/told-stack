import * as fs from 'fs';
import * as path from 'path';

export function generateEntry(rootDirName: string) {
    // Dynamic Entries
    const searchPaths = [
        `${rootDirName}/config/_functions/`
    ];

    const entryPathNames: { path: string, name: string }[] = [
        // { path: `${__dirname}/example/_functions/lookup-lsc-01-http.ts`, name: 'lookup-lsc-01-http' },
    ];
    searchPaths.forEach(p => {
        if (!fs.existsSync(p)) {
            console.error('!!! Webpack generateEntry searchPath does\'t exist', { p });
            return;
        }
        entryPathNames.push(...fs.readdirSync(p).map(x => ({ path: p + x, name: path.parse(x).name })));
    });

    console.log('Webpack', { entryPathNames });

    const entry: { [key: string]: string } = {};
    entryPathNames.forEach(x => entry[`./_deploy/${x.name}/bundle.js`] = x.path);
    return entry;
}