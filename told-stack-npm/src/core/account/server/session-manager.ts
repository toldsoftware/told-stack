import { AccountServerConfig } from "../config/server-config";
import { SessionInfo, AccountPermission } from "../config/types";
import { createSessonToken_server } from "../config/account-ids";
import { saveTableEntities_merge } from "../../utils/azure-storage-binding/tables-sdk";

export class SessionManager {
    constructor(private config: AccountServerConfig) { }

    async createNewSession(userId: string, accountPermissions: AccountPermission[], userAuthorizations: string[], oldSessionToken?: string): Promise<SessionInfo> {
        const sessionToken = createSessonToken_server();
        const sessionInfo: SessionInfo = {
            sessionToken,
            userId,
            accountPermissions,
            userAuthorizations,
        };

        const sessionTableBinding = this.config.getBinding_sessionTable_fromSessionToken({ sessionToken });

        await saveTableEntities_merge(sessionTableBinding,
            {
                // Session User
                PartitionKey: sessionTableBinding.partitionKey,
                RowKey: sessionTableBinding.rowKey,
                fromSessionToken: oldSessionToken,
                ...sessionInfo
            }, {
                // User Sessions List
                PartitionKey: userId,
                RowKey: sessionToken,
                fromSessionToken: oldSessionToken,
                ...sessionInfo
            });

        return sessionInfo;
    }

}

