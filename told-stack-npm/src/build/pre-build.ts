import { buildFunctionRunFile } from "./build-function-files";
import { EntryInfo } from "../core/types/entry";

export async function runPreBuild(entries:EntryInfo[]) {
    await buildFunctionRunFile({ destDir: '_deploy' }, entries);
}