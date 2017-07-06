import { DataKey } from "@told/stack/lib/data-pattern-lookup-lsc/src-config/config";

export interface TestBlob {
    data: {
        key: DataKey;
        time: Date;
        oldBlob: TestBlob;
    }
}

export async function obtainTestBlobData(oldBlob: TestBlob, key: DataKey) {
    return {
        data: {
            key,
            time: new Date(),
            oldBlob
        }
    } as TestBlob;
}