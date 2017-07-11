import { buildFunctionRunFile } from "./build-function-files";
import { EntryInfo } from "../core/types/entry";

export async function runPreBuild(entries: EntryInfo[], intermediateToConfigEntriesPath = '../../config') {
    await buildFunctionRunFile({ intermediateDestDir: '_intermediate', configPath: intermediateToConfigEntriesPath }, entries);
}
