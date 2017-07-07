export function insertOrMergeTableRow(table_in: any, table_out: any, data: any) {
    if (table_in) {
        for (let k in data) {
            table_in[k] = data[k];
        }
    } else {
        table_out = data;
    }
}