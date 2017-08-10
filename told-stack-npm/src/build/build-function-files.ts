import * as fs from 'fs-extra';
import * as path from 'path';

import { asyncNode_noError, asyncNode } from "../core/utils/async-node";
import { EntryInfoResolved, EntryInfo, isEntryInfoFunctionBase } from "./entry";
import { joinImportPath } from "./join-import-path";
import { generateFunctionJsonDoc } from "../core/azure-functions/function-base-generate";

const deployDir = '_deploy';
const intermediateDir = '_intermediate';

export async function buildFunctionJsonAndIndexFiles(options: {
    destDir: string
}, entries: EntryInfoResolved[]) {
    const destDir = options.destDir || deployDir;
    const destDirFullPath = path.resolve(destDir);
    await fs.ensureDir(destDirFullPath);

    console.log('buildFunctionJsonAndIndexFiles START', { destDirFullPath });

    for (let x of entries) {
        const functionJsonFile = generateFunctionJson(x);
        const functionIndexFile = getFunctionIndexFile()

        // Output to destDir
        const outDir = `${destDirFullPath}/${x.name}`;
        await fs.ensureDir(outDir);
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

    await fs.ensureDir(destDirFullPath);

    console.log('buildFunctionRunFile START', { destDirFullPath });

    for (let x of entries) {
        // Add another ../ because entries are in a folder
        const functionJsonFile = getRunFunctionFile(x, '../' + configPath);

        // Output to destDir
        const outDir = `${destDirFullPath}/entries`;
        await fs.ensureDir(outDir);
        fs.writeFile(`${outDir}/${x.name}.ts`, functionJsonFile, (err) => {
            if (err) { console.error('buildFunctionRunFile writeFile ERROR', { err, file: `${outDir}/${x.name}.ts` }); }
        });
        console.log('buildFunctionRunFile ', { name: x.name });
    }

    console.log('buildFunctionRunFile END', { destDirFullPath });
}

function generateFunctionJson(x: EntryInfoResolved) {
    if (isEntryInfoFunctionBase(x)) {
        const def = new x.import_required.FunctionDefinition(x.configImport_required.configNamed);
        return JSON.stringify(generateFunctionJsonDoc(def), null, ' ');
    } else {
        return JSON.stringify(x.import_required.createFunctionJson(x.configImport_required.configNamed), null, ' ');
    }
}

function getRunFunctionFile(entry: EntryInfo, configPath: string) {
    const importPath = joinImportPath(configPath, entry.import);
    const configImportPath = joinImportPath(configPath, entry.configImport);
    const configName = entry.configName || 'config';

    if (entry.type === 'function-base') {
        return `
import { Function } from '${importPath}';
import { ${configName} } from '${configImportPath}';

const run = function (...args: any[]) {
    const f = new Function(${configName});
    f.run.apply(f, [...args]);
};

declare const global: any;
declare const module: any;
global.__run = run;
module.exports = global.__run;
`;
    } else {
        return `
import { runFunction } from '${importPath}';
import { ${configName} } from '${configImportPath}';

const run = function (...args: any[]) {
    runFunction.apply(null, [${configName}, ...args]);
};

declare const global: any;
declare const module: any;
global.__run = run;
module.exports = global.__run;
`;
    }

}

function getFunctionIndexFile() {
    return `
require('./bundle');
module.exports = global.__run;
`;
}