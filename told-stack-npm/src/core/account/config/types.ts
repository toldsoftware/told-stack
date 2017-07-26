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
    userCredential?: UserCredential;
}

export enum UserAccess {
    None = '',
    None_SendEmailVerification = 'None_SendEmailVerification',
    Full = 'Full',
    Full_CreatePassword = 'Full_CreatePassword',
}

export enum UserCredentialKind {
    email_unverified = 'email_unverified',
    email_verification = 'email_verification',
}

export type UserCredential =
    { kind: UserCredentialKind.email_unverified; access:UserAccess.None_SendEmailVerification; email: string; }
    | { kind: UserCredentialKind.email_verification; access:UserAccess.Full_CreatePassword; email: string; verificationToken: string; }