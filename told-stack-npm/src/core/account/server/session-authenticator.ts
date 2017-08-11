import { SessionTable, AccountPermission, verifyAccountPermission } from "../config/types";
import { AccountServerConfig } from "../config/server-config";

export class SessionAuthenticator {
    constructor(private inSessionTable: SessionTable) { }

    authenticateSession_accountPermission(userPermission: AccountPermission): boolean {
        const inSessionTable = this.inSessionTable;
        if (!inSessionTable) { return false; }

        return verifyAccountPermission(inSessionTable.accountPermissions, userPermission);
    }

    getUserId(): string {
        const inSessionTable = this.inSessionTable;
        if (!inSessionTable) { return null; }

        return inSessionTable.userId;
    }
}
