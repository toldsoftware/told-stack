import { EntryInfo, EntryInfoResolved } from "../core/types/entry";
import { joinImportPath } from "./join-import-path";

export function resolveEntries(entries: EntryInfo[], requireCallback: (importPath: string) => any): EntryInfoResolved[] {
    return entries.map(x => ({
        ...x,
        import_required: requireCallback(x.import),
        configImport_required: requireCallback(x.configImport),
    }));
}