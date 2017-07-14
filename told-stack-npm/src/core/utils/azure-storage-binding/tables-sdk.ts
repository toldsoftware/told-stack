import { saveEntity } from "../azure-storage-sdk/tables";

export async function insertOrMergeTableEntity_sdk(rowKey: { table: string, partition: string, row: string }, table_in: any, data: any) {
    if (table_in) {
        await saveEntity(rowKey.table, rowKey.partition, rowKey.row, data);
        return undefined;
    } else {
        return data;
    }
}