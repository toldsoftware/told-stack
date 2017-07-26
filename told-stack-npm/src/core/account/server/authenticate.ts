import { SessionTable, SessionInfo_Client } from "../config/types";

export enum AuthenticateResult {
    UnknownSession,
    // MissingUserIdClaim,
    // IncorrectUserIdClaim,

    AnonymousUser,
    Authenticated,
}

export function authenticate(inSessionTable: SessionTable, sessionInfo: SessionInfo_Client): AuthenticateResult {
    if (!inSessionTable || !sessionInfo) { return AuthenticateResult.UnknownSession; }

    // Not Possible, since sessionInfo is used to lookup sessionTable binding
    // if (inSessionTable.sessionToken !== sessionInfo.sessionToken) { return AuthenticateResult.InvalidSession; }

    // if (!sessionInfo.userId_claimed) { return AuthenticateResult.MissingUserIdClaim; }
    // if (inSessionTable.userId !== sessionInfo.userId_claimed) { return AuthenticateResult.IncorrectUserIdClaim; }

    if (inSessionTable.isAnonymous) { return AuthenticateResult.AnonymousUser; }
    return AuthenticateResult.Authenticated;
}

