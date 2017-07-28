import { TestConfig } from "./_config";
import { loadTableEntity } from "../../utils/azure-storage-binding/tables-sdk";
import { SessionTable, AccountTable } from "../config/types";

export async function loadSessionTableEntity(testConfig: TestConfig, sessionToken: string) {
    // Manually load session table
    const binding = testConfig.serverConfig.getBinding_SessionTable_fromSessionToken({ sessionToken });
    const entity = await loadTableEntity<SessionTable>(
        binding,
        binding.partitionKey,
        binding.rowKey
    );

    return entity;
}

export async function loadAccountTableEntity(testConfig: TestConfig, userId: string, value: string) {
    // Manually load account table
    const binding = testConfig.serverConfig.getBinding_AccountTable();
    const entity = await loadTableEntity<AccountTable>(
        binding,
        userId,
        value,
    );

    return entity;
}