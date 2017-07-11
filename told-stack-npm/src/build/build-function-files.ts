import * as fs from 'fs';
import * as path from 'path';
import { asyncNode_noError, asyncNode } from "../core/utils/async-node";
import { EntryInfoResolved, EntryInfo } from "../core/types/entry";
import { joinImportPath } from "./join-import-path";

const deployDir = '_deploy';
const intermediateDir = '_intermediate';

export async function buildFunctionJsonAndIndexFiles(options: {
    destDir: string
}, entries: EntryInfoResolved[]) {
    const destDir = options.destDir || deployDir;
    const destDirFullPath = path.resolve(destDir);
    await ensureDirectoryExists(destDirFullPath);

    console.log('buildFunctionJsonAndIndexFiles START', { destDirFullPath });

    for (let x of entries) {
        const functionJsonFile = JSON.stringify(x.import_required.createFunctionJson(x.configImport_required.config), null, ' ');
        const functionIndexFile = getFunctionIndexFile()

        // Output to destDir
        const outDir = `${destDirFullPath}/${x.name}`;
        await ensureDirectoryExists(outDir);
        fs.writeFile(`${outDir}/function.json`, functionJsonFile, (err) => {
            if (err) { console.error('buildFunctionJsonAndIndexFiles writeFile ERROR', { err, file: `${outDir}/function.json` }); }
        });
        fs.writeFile(`${outDir}/index.js`, functionIndexFile, (err) => {
            if (err) { console.error('buildFunctionJsonAndIndexFiles writeFile ERROR', { err, file: `${outDir}/index.json` }); }
        });

        console.log('buildFunctionJsonAndIndexFiles ', { name: x.name });
    }

    console.log('buildFunctionJsonAndIndexFiles END', { destDirFullPath });
}

export async function buildFunctionRunFile(options: {
    intermediateDestDir: string,
    configPath: string
}, entries: EntryInfo[]) {
    const configPath = options.configPath || '../../config/';
    const destDir = options.intermediateDestDir || intermediateDir;
    const destDirFullPath = path.resolve(destDir);

    await ensureDirectoryExists(destDirFullPath);

    console.log('buildFunctionRunFile START', { destDirFullPath });

    for (let x of entries) {
        // Add another ../ because entries are in a folder
        const functionJsonFile = getRunFunctionFile(x, '../' + configPath);

        // Output to destDir
        const outDir = `${destDirFullPath}/entries`;
        await ensureDirectoryExists(outDir);
        fs.writeFile(`${outDir}/${x.name}.ts`, functionJsonFile, (err) => {
            if (err) { console.error('buildFunctionRunFile writeFile ERROR', { err, file: `${outDir}/${x.name}.ts` }); }
        });
        console.log('buildFunctionRunFile ', { name: x.name });
    }

    console.log('buildFunctionRunFile END', { destDirFullPath });
}

export async function ensureDirectoryExists(dir: string) {
    const exists = await asyncNode_noError<boolean>(cb => fs.exists(dir, cb));
    // console.log('ensureDirectoryExists ', { dir, exists });

    if (!exists) {
        console.log('ensureDirectoryExists MakeDirectory', { dir });
        await asyncNode_noError(cb => fs.mkdir(dir, cb));
    }
}

function getRunFunctionFile(entry: EntryInfo, configPath: string) {
    const importPath = joinImportPath(configPath, entry.import);
    const configImportPath = joinImportPath(configPath, entry.configImport);

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