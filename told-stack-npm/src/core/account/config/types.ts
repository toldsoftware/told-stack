export interface SessionInfo_Client {
    sessionToken: string;
    userId_claimed: string;
    isAnonymous: boolean;
}

export interface SessionInfo {
    sessionToken: string;
    userId: string;
    isAnonymous: boolean;
}

export interface SessionTable extends SessionInfo {
    PartitionKey: string;
    RowKey: string;
    fromSessionToken?: string;
}

export interface AccountTable extends SessionInfo {
    PartitionKey: string;
    RowKey: string;
    fromSessionToken?: string;
    userClaim?: UserClaim;
}

export type UserClaim = {
    email: string
};