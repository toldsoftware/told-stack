import { SessionTable, SessionInfo_Client } from "../config/types";
import { AccountServerConfig } from "../config/server-config";

export enum AuthenticateResult {
    UnknownSession,
    // MissingUserIdClaim,
    // IncorrectUserIdClaim,

    AnonymousUser,
    Authenticated,
}

export class SessionAuthenticator {
    constructor(private context: { bindings: { inSessionTable: SessionTable } }) { }

    authenticateSession(sessionInfo: SessionInfo_Client): AuthenticateResult {
        const inSessionTable = this.context.bindings.inSessionTable;
        if (!inSessionTable || !sessionInfo) { return AuthenticateResult.UnknownSession; }

        // Not Possible, since sessionInfo is used to lookup sessionTable binding
        // if (inSessionTable.sessionToken !== sessionInfo.sessionToken) { return AuthenticateResult.InvalidSession; }

        // if (!sessionInfo.userId_claimed) { return AuthenticateResult.MissingUserIdClaim; }
        // if (inSessionTable.userId !== sessionInfo.userId_claimed) { return AuthenticateResult.IncorrectUserIdClaim; }

        if (inSessionTable.isAnonymous) { return AuthenticateResult.AnonymousUser; }
        return AuthenticateResult.Authenticated;
    }
}



