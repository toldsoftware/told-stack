import { TableBinding } from "../../types/functions";

export interface EncryptionPasswordTable {
    password: string;
}

export class EncryptionConfig {
    getBinding_encryptionPasswordTable = (trigger: { passwordId: string }): TableBinding => {
        return {
            connection: 'ENCRYPTION_STORAGE_CONNECTION_STRING',
            tableName: 'encryptionpasswords',
            partitionKey: `${trigger.passwordId}`,
            rowKey: 'password',
        };
    }
}