import { SessionInfo_Client, UserPermission, SessionInfo } from "../config/types";
import { createSessonToken_client, createUserId_anonymous_client } from "../config/account-ids";

export class ClientSession implements SessionInfo_Client {
    public sessionToken = createSessonToken_client();
    public isAnonymous = true;

    public userId_claimed: string = null;
    public userPermissions_claimed: UserPermission[] = [];

    constructor() {
        this.userId_claimed = createUserId_anonymous_client();
    }

    setSessionInfo(sessionInfo: SessionInfo) {
        this.isAnonymous = false;
        this.sessionToken = sessionInfo.sessionToken;
        this.userId_claimed = sessionInfo.userId;
        this.userPermissions_claimed = sessionInfo.userPermissions;
    }
}

