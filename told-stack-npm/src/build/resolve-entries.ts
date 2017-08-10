import { EntryInfo, EntryInfoResolved } from "../core/types/entry";
import { joinImportPath } from "./join-import-path";

export function resolveEntries(entries: EntryInfo[], requireCallback: (importPath: string) => any): EntryInfoResolved[] {
    return entries.map(x => ({
        ...x,
        type: x.type,
        import_required: requireCallback(x.import),
        configImport_required: { configNamed: requireCallback(x.configImport)[x.configName] },
    }));
}