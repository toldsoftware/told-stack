import { AccountServerConfig } from "../config/server-config";
import { SessionInfo, UserPermission } from "../config/types";
import { createSessonToken_server } from "../config/account-ids";
import { saveTableEntities } from "../../utils/azure-storage-binding/tables-sdk";

export class SessionManager {
    constructor(private config: AccountServerConfig) { }

    async createNewSession(userId: string, userPermissions: UserPermission[], oldSessionToken?: string): Promise<SessionInfo> {
        const sessionToken = createSessonToken_server();
        const sessionInfo: SessionInfo = {
            sessionToken,
            userId,
            userPermissions,
            
            oldSessionToken,
        };

        const sessionTableBinding = this.config.getBinding_SessionTable_fromSessionToken({ sessionToken });

        await saveTableEntities(sessionTableBinding,
            {
                // Session User
                PartitionKey: sessionTableBinding.partitionKey,
                RowKey: sessionTableBinding.rowKey,
                sessionToken,
                userId,
                isAnonymous: false,
                fromSessionToken: sessionInfo.sessionToken,
            }, {
                // User Sessions List
                PartitionKey: userId,
                RowKey: sessionToken,
                sessionToken,
                userId,
                isAnonymous: false,
                fromSessionToken: sessionInfo.sessionToken,
            });

        return sessionInfo;
    }

}

