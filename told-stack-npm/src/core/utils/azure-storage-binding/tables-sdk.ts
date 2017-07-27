import { saveEntity_merge, loadEntity_parse, EntityValues, loadEntities_prefix } from "../azure-storage-sdk/tables";
import { TableBinding } from "../../types/functions";

export type EntityValuesWithKeys = { PartitionKey: string, RowKey: string } & EntityValues;

export async function insertOrMergeTableEntity_sdk(connection: string, rowKey: { table: string, partition: string, row: string }, table_in: any, data: any) {
    if (table_in) {
        await saveEntity_merge(connection, rowKey.table, rowKey.partition, rowKey.row, data);
        return undefined;
    } else {
        return data;
    }
}

export async function saveTableEntities_merge(tableBinding: TableBinding, ...entities: EntityValuesWithKeys[]) {
    for (let x of entities) {
        await saveEntity_merge(tableBinding.connection, tableBinding.tableName, x.PartitionKey, x.RowKey, x);
    }
}

export async function loadTableEntity<T>(tableBinding: TableBinding, partitionKey: string, rowKey: string) {
    return await loadEntity_parse<T>(tableBinding.connection, tableBinding.tableName, partitionKey, rowKey);
}

export async function findTableEntities<T>(tableBinding: TableBinding, partitionKey: string, rowKey_prefix: string){
    return await loadEntities_prefix<T>(tableBinding.connection, tableBinding.tableName, partitionKey, rowKey_prefix);
}