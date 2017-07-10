import { buildFunctionRunFile } from "./build-function-files";
import { EntryInfo } from "../core/types/entry";

export async function runPreBuild(entries: EntryInfo[], functionsDestDir = '_deploy') {
    await buildFunctionRunFile({ destDir: functionsDestDir }, entries);
}
