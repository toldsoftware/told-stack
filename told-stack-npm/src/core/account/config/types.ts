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

    userAlias?: UserAlias;
    userCredential?: UserEvidence;

    isDisabled?: boolean;
}

export enum UserPermission {
    None = '',
    SendEmail_ResetPassword = 'SendEmail_ResetPassword',
    ResetPassword = 'ResetPassword',
    Full = 'Full',
}

export function getUserAccess_userAliasKind(kind: UserAliasKind): UserPermission[] {
    switch (kind) {
        case UserAliasKind.facebookId:
            return [UserPermission.Full];

        case UserAliasKind.email_unverified:
        case UserAliasKind.email_verified:
            return [UserPermission.SendEmail_ResetPassword];

        default:
            return [];
    }
}

export function getUserAccess_userCredentialKind(kind: UserEvidenceKind): UserPermission[] {
    switch (kind) {
        case UserEvidenceKind.password:
            return [UserPermission.Full];

        case UserEvidenceKind.token_resetPassword:
            return [UserPermission.ResetPassword];

        default:
            return [];
    }
}

export enum UserAliasKind {
    email_unverified = 'email_unverified',
    email_verified = 'email_verified',
    facebookId = 'facebookId',
}

export enum UserEvidenceKind {
    password = 'password',
    token_resetPassword = 'token_resetPassword',
}

export type UserAlias =
    {
        kind: UserAliasKind.email_unverified;
        email: string;
    }
    ;

export type UserEvidence =
    {
        kind: UserEvidenceKind.token_resetPassword;
        resetPasswordToken: string;
        expireTime: number;
    }
    ;