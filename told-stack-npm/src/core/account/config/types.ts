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