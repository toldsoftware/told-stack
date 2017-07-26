import { createTableService, TableService, TableUtilities, TableQuery, ErrorOrResult } from "azure-storage";
import { asyncIt } from "./async-it";

const FORCE_LOWER_CASE = false;

const entGen = TableUtilities.entityGenerator;

export type EntityValueTypes = string | boolean | number | Date | Object;
export type EntityValues = { [key: string]: EntityValueTypes };

export async function doesEntityExist(connection: string, tableName: string, partitionKey: string, rowKey: string) {
    const tableService = createTableService(connection);

    if (FORCE_LOWER_CASE) {
        partitionKey = partitionKey.toLowerCase();
        rowKey = rowKey.toLowerCase();
    }

    try {
        const result = await asyncIt<any>(cb => tableService.retrieveEntity(tableName, partitionKey, rowKey, cb));
        return true;
    } catch (err) {
        return false;
    }
}

export async function saveEntity(connection: string, tableName: string, partitionKey: string, rowKey: string, values: EntityValues, ...aliases: string[]) {
    const tableService = createTableService(connection);

    if (FORCE_LOWER_CASE) {
        partitionKey = partitionKey.toLowerCase();
        rowKey = rowKey.toLowerCase();
        aliases = aliases.map(x => x.toLowerCase());
    }

    // Ensure Table Exists
    await asyncIt(cb => tableService.createTableIfNotExists(tableName, cb));

    // Save Data
    const entity = convertToEntity(tableService, partitionKey, rowKey, values);
    const result = await asyncIt<TableService.EntityMetadata>(cb => tableService.insertOrMergeEntity(tableName, entity, {}, cb));

    // Save Aliases
    for (let a of aliases) {
        const aliasEntity = convertToEntity(tableService, partitionKey, a, { _ref: '' + rowKey });
        await asyncIt<TableService.EntityMetadata>(cb => tableService.insertOrMergeEntity(tableName, aliasEntity, {}, cb));
    }

    return result;
}

export async function loadEntity_parse<T>(connection: string, tableName: string, partitionKey: string, rowKeyOrAlias: string, shouldAutoParseJson = true): Promise<T> {
    const tableService = createTableService(connection);

    if (FORCE_LOWER_CASE) {
        partitionKey = partitionKey.toLowerCase();
        rowKeyOrAlias = rowKeyOrAlias.toLowerCase();
    }

    try {

        // Get Entity
        let entity = await asyncIt<EntityValues>(cb => tableService.retrieveEntity(tableName, partitionKey, rowKeyOrAlias, { entityResolver }, cb));

        // Dereference Alias
        if (entity._ref) {
            entity = await asyncIt<EntityValues>(cb => tableService.retrieveEntity(tableName, partitionKey, entity._ref as string, { entityResolver }, cb));
        }

        const timestamp = Date.parse(entity.Timestamp as string);
        const metadata = {
            _timestamp: timestamp,
            _ageMs: Date.now() - timestamp,
        };

        const data = entity;

        if (shouldAutoParseJson) {
            for (let k in data) {
                const x = data[k];
                if (typeof x === 'string') {
                    try {
                        data[k] = JSON.parse(x);
                    } catch (err) { }
                }
            }
        }

        return { ...data, ...metadata } as typeof entity & typeof metadata & T;
    } catch (err) {
        console.warn(err);

        if (err && err.code === 'ResourceNotFound') {
            return null;
        }

        throw err;
    }
}

// export async function loadEntity(connection: string, tableName: string, partitionKey: string, rowKey: string) {

//     if (FORCE_LOWER_CASE) {
//         partitionKey = partitionKey.toLowerCase();
//         rowKey = rowKey.toLowerCase();
//     }

//     const tableService = createTableService(connection);

//     try {

//         // Get Entity
//         const result = await asyncIt<TableService.QueryEntitiesResult<EntityValues>>(cb => tableService.retrieveEntity(tableName, partitionKey, rowKey, { entityResolver }, cb));
//         return result.entries[0];
//     } catch (err) {
//         console.warn(err);

//         // if (err && err.code === 'ResourceNotFound') {
//         //     return null;
//         // }

//         throw err;
//     }
// }

export async function loadEntities(connection: string, tableName: string, partitionKey: string, count: number) {

    if (FORCE_LOWER_CASE) {
        partitionKey = partitionKey.toLowerCase();
    }

    const query = new TableQuery()
        .top(count)
        .where('PartitionKey eq ?', partitionKey);

    return queryEntities(connection, tableName, query);
}

export async function queryEntities(connection: string, tableName: string, query: TableQuery) {
    const tableService = createTableService(connection);

    try {

        // Get Entity
        const result = await asyncIt<TableService.QueryEntitiesResult<EntityValues>>(cb => tableService.queryEntities(tableName, query, null, { entityResolver }, cb));
        return result.entries;
    } catch (err) {
        console.warn(err);

        // if (err && err.code === 'ResourceNotFound') {
        //     return null;
        // }

        throw err;
    }
}

function entityResolver(en: any) {
    const r = {} as any;
    for (let k in en) {
        r[k] = en[k]._;
    }
    return r;
}

function convertToEntity(tableService: TableService, partitionKey: string, rowKey: string, values: { [key: string]: any }) {

    const entity = Object.getOwnPropertyNames(values).reduce((o, k) => {
        o[k] = convertToEntityValue(values[k]);
        return o;
    }, {} as { [key: string]: any });

    entity.PartitionKey = entGen.String(partitionKey);
    entity.RowKey = entGen.String(rowKey);

    return entity;
}

function convertToEntityValue(value: EntityValueTypes): any {

    if (typeof value === 'undefined') {
        return undefined;
    } else if (value === undefined) {
        return undefined;
    } else if (value === null) {
        return undefined;
    } else if (typeof value === 'string') {
        return entGen.String(value);
    } else if (typeof value === 'boolean') {
        return entGen.Boolean(value);
    } else if (typeof value === 'number') {
        if (Math.floor(value) === value) {
            return entGen.Int64(value);
        } else {
            return entGen.Double(value);
        }
    } else if (value instanceof Date) {
        return entGen.DateTime(value);
    } else { // if (typeof value === 'object') {
        return entGen.String(JSON.stringify(value));
    }
}