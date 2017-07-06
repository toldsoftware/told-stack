import { buildFunctionJsonAndIndexFiles } from "./build-function-files";
import { EntryInfoResolved } from "../core/types/entry";

export async function runPostBuild(entriesRequired: EntryInfoResolved[]) {
    await buildFunctionJsonAndIndexFiles({ destDir: '_deploy' }, entriesRequired);
}
