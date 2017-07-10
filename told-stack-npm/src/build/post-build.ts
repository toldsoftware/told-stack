import { buildFunctionJsonAndIndexFiles } from "./build-function-files";
import { EntryInfoResolved } from "../core/types/entry";

export async function runPostBuild(entriesRequired: EntryInfoResolved[], functionsDestDir = '_deploy') {
    await buildFunctionJsonAndIndexFiles({ destDir: functionsDestDir }, entriesRequired);
}
