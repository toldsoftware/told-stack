import * as fs from 'fs';
import * as path from 'path';
import { asyncNode_noError } from "../core/utils/async-node";
import { EntryInfoResolved, EntryInfo } from "../core/types/entry";
import { joinImportPath } from "./join-import-path";

const deployDir = '_deploy';
const intermediateDir = '_intermediate';

export async function buildFunctionJsonAndIndexFiles(options: {
    destDir: string
}, entries: EntryInfoResolved[]) {
    const destDir = deployDir;
    const destDirFullPath = path.resolve(destDir);
    await ensureDirectoryExists(destDirFullPath);

    console.log('buildFunction START', { destDirFullPath });

    for (let x of entries) {
        const functionJsonFile = JSON.stringify(x.import_required.createFunctionJson(x.configImport_required.config), null, ' ');
        const functionIndexFile = getFunctionIndexFile()

        // Output to destDir
        const outDir = `${destDirFullPath}/${x.name}`;
        await ensureDirectoryExists(outDir);
        fs.writeFile(`${outDir}/function.json`, functionJsonFile);
        fs.writeFile(`${outDir}/index.js`, functionIndexFile);

        console.log('buildFunction ', { name: x.name });
    }

    console.log('buildFunction END', { destDirFullPath });
}

export async function buildFunctionRunFile(options: {
    destDir: string
}, entries: EntryInfo[]) {
    const destDir = intermediateDir;
    const destDirFullPath = path.resolve(destDir);
    await ensureDirectoryExists(destDirFullPath);

    console.log('buildFunction START', { destDirFullPath });

    for (let x of entries) {
        const functionJsonFile = getRunFunctionFile(x);

        // Output to destDir
        const outDir = `${destDirFullPath}/entries`;
        await ensureDirectoryExists(outDir);
        fs.writeFile(`${outDir}/${x.name}.ts`, functionJsonFile);
        console.log('buildFunction ', { name: x.name });
    }

    console.log('buildFunction END', { destDirFullPath });
}

export async function ensureDirectoryExists(dir: string) {
    const exists = await asyncNode_noError<boolean>(cb => fs.exists(dir, cb));
    if (!exists) {
        await fs.mkdir(dir);
    }
}

function getRunFunctionFile(entry: EntryInfo) {
    const importPath = joinImportPath('../../config/', entry.import);
    const configImportPath = joinImportPath('../../config/', entry.configImport);

    return `
import { runFunction } from '${importPath}';
import { config } from '${configImportPath}';

const run = function (...args: any[]) {
    runFunction.apply(null, [config, ...args]);
};

declare const global: any;
global.__run = run;
module.exports = global.__run;
`;

}

function getFunctionIndexFile() {
    return `
require('./bundle');
module.exports = global.__run;
`;
}