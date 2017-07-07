export function insertOrMergeTableRow(table_in: any, data: any) {
    if (table_in) {
        for (let k in data) {
            table_in[k] = data[k];
        }
        return table_in;
    } else {
        return data;
    }
}