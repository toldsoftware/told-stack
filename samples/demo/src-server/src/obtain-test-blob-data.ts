import { DataKey } from "@told/stack/src/data-patterns/lookup-lsc/src-config/server-config";

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