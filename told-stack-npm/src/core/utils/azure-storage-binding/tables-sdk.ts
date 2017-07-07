import { saveRow } from "../azure-storage-sdk/tables";

export async function insertOrMergeTableRow_sdk(rowKey: { table: string, partition: string, row: string }, table_in: any, data: any) {
    if (table_in) {
        await saveRow(rowKey.table, rowKey.partition, rowKey.row, data);
        return undefined;
    } else {
        return data;
    }
}