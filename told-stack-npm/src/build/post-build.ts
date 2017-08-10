import { buildFunctionJsonAndIndexFiles } from "./build-function-files";
import { EntryInfoResolved } from "./entry";
import { cloneDirectory } from "./clone-directory";

export async function runPostBuild(entriesRequired: EntryInfoResolved[], functionsDestDir = '_deploy', functionsDestDir_testing = '') {
    console.log('runPostBuild: START', { functionsDestDir, functionsDestDir_testing });
    console.log('runPostBuild: buildFunctionJsonAndIndexFiles');
    
    await buildFunctionJsonAndIndexFiles({ destDir: functionsDestDir }, entriesRequired);
    if (functionsDestDir_testing) {
        console.log('runPostBuild: Clone to Testing Deploy', { functionsDestDir_testing });
        await cloneDirectory({ sourceDir: functionsDestDir, destDir: functionsDestDir_testing, excluded: [/\.git|appsettings\.json|host\.json$/g] });
    }
    
    console.log('runPostBuild: DONE');
}
