import { EntryInfo, EntryInfoResolved } from "../core/types/entry";

export function resolveEntries(entries: EntryInfo[]): EntryInfoResolved[] {
    return entries.map(x => ({
        ...x,
        import_required: require('../../config/' + x.import),
        configImport_required: require('../../config/' + x.configImport),
    }));
}