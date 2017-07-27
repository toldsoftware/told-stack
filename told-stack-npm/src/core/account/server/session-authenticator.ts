import { SessionTable, AccountPermission, verifyUserPermission } from "../config/types";
import { AccountServerConfig } from "../config/server-config";

export class SessionAuthenticator {
    constructor(private context: { bindings: { inSessionTable: SessionTable } }) { }

    authenticateSession_userPermission(userPermission: AccountPermission): boolean {
        const inSessionTable = this.context.bindings.inSessionTable;
        if (!inSessionTable) { return false; }

        return verifyUserPermission(inSessionTable.accountPermissions, userPermission);
    }
}



