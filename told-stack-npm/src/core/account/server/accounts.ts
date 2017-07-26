import { AccountTable, SessionInfo_Client, UserClaim, SessionInfo } from "../config/types";
import { createSessonToken_server, createUserId_server } from "../config/account-ids";
import { hashEmail_partial } from "../../utils/hash";

export function createNewUserAndSession(outAccountTable: AccountTable[], sessionInfo: SessionInfo_Client, ...claims: UserClaim[]): SessionInfo {
    const sessionToken = createSessonToken_server();
    const userId = createUserId_server();

    outAccountTable = [{
        // Session User
        PartitionKey: sessionToken,
        RowKey: 'session-user',
        sessionToken,
        userId,
        isAnonymous: false,
        fromSessionToken: sessionInfo.sessionToken,
    }, {
        // User Sessions
        PartitionKey: userId,
        RowKey: sessionToken,
        sessionToken,
        userId,
        isAnonymous: false,
        fromSessionToken: sessionInfo.sessionToken,
    }, {
        // User List Partition
        PartitionKey: 'users',
        RowKey: userId,
        userId,
        sessionToken: undefined,
        isAnonymous: undefined,
        fromSessionToken: undefined,
    }];

    // Claims
    for (let x of claims) {
        if (x.email) {
            const emailHash = hashEmail_partial(x.email);
            outAccountTable.push(...[{
                // Claim Lookup
                PartitionKey: emailHash,
                RowKey: 'email-userId',
                userClaim: x,
                userId: userId,
                sessionToken: undefined,
                isAnonymous: undefined,
                fromSessionToken: undefined,
            }, {
                // User Claims List
                PartitionKey: userId,
                RowKey: 'claim_email_' + emailHash,
                userClaim: x,
                userId: userId,
                sessionToken: undefined,
                isAnonymous: undefined,
                fromSessionToken: undefined,
            },]);
        }
    }

    return {
        sessionToken,
        userId,
        isAnonymous: false,
    };
}