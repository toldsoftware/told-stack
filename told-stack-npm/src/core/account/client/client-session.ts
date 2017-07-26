import { SessionInfo_Client } from "../config/types";
import { createSessonToken_client, createUserId_anonymous_client } from "../config/account-ids";

export class ClientSession implements SessionInfo_Client {
    public sessionToken = createSessonToken_client();
    public isAnonymous = true;
    public userId_claimed: string = null;

    constructor() {
        this.userId_claimed = createUserId_anonymous_client();
    }

    setAuthenticatedId(sessionToken:string, userId: string) {
        this.isAnonymous = false;
        this.sessionToken = sessionToken;
        this.userId_claimed = userId;
    }
}

