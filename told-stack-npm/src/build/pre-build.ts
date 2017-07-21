import { buildFunctionRunFile } from "./build-function-files";
import { EntryInfo } from "../core/types/entry";

export async function runPreBuild(entries: EntryInfo[], intermediateToConfigEntriesPath = '../../config', intermediateDestDir = '_intermediate') {
    await buildFunctionRunFile({ intermediateDestDir, configPath: intermediateToConfigEntriesPath }, entries);
}
