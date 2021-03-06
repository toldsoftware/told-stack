import { SessionInfo_Client, AccountPermission, SessionInfo, verifyAccountPermission } from "../config/types";
import { createSessonToken_client, createUserId_anonymous_client } from "../config/account-ids";
export { AccountPermission };

export class ClientSession implements SessionInfo_Client {
    public sessionToken = createSessonToken_client();
    public isAnonymous = true;

    public userId_claimed: string = null;
    public accountPermissions_claimed: AccountPermission[] = [];

    constructor() {
        this.userId_claimed = createUserId_anonymous_client();
    }

    setSessionInfo(sessionInfo: SessionInfo) {
        this.isAnonymous = false;
        this.sessionToken = sessionInfo.sessionToken;
        this.userId_claimed = sessionInfo.userId;
        this.accountPermissions_claimed = sessionInfo.accountPermissions;
    }

    verifyAccountPermission_claimed(requiredPermission: AccountPermission) {
        // This doesn't provide actual security, it just allows the UI to do some pre-verification for valid clients
        return verifyAccountPermission(this.accountPermissions_claimed, requiredPermission);
    }
}

