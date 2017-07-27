export interface SessionInfo_Client {
    sessionToken: string;
    isAnonymous: boolean;

    userId_claimed: string;
    userPermissions_claimed: UserPermission[];
}

export interface SessionInfo {
    sessionToken: string;
    userId: string;
    userPermissions: UserPermission[];

    oldSessionToken?: string;
}

export interface SessionTable extends SessionInfo {
    PartitionKey: string;
    RowKey: string;

    fromSessionToken?: string;
}

export interface AccountTable {
    PartitionKey: string;
    RowKey: string;

    userId: string;

    userAlias?: UserAlias;
    userCredential?: UserEvidence;

    isDisabled?: boolean;
}

export function verifyUserPermission(actualPermissions: UserPermission[], requiredPermission: UserPermission) {
    return actualPermissions.indexOf(UserPermission.Full) >= 0
        || actualPermissions.indexOf(requiredPermission) >= 0;
}

export enum UserPermission {
    None = '',
    SendEmail_ResetPassword = 'SendEmail_ResetPassword',
    ChangePassword = 'ChangePassword',
    Full = 'Full',
}

export function getUserPermissions_userAliasKind(kind: UserAliasKind): UserPermission[] {
    switch (kind) {
        case UserAliasKind.facebookId:
            return [UserPermission.Full];

        case UserAliasKind.email:
            return [UserPermission.SendEmail_ResetPassword];

        default:
            return [];
    }
}

export function getUserPermissions_userCredentialKind(kind: UserEvidenceKind): UserPermission[] {
    switch (kind) {
        case UserEvidenceKind.password:
            return [UserPermission.Full];

        case UserEvidenceKind.token_resetPassword:
            return [UserPermission.ChangePassword];

        default:
            return [];
    }
}

export enum UserAliasKind {
    email = 'email',
    facebookId = 'facebookId',
}

export enum UserEvidenceKind {
    password = 'password',
    token_resetPassword = 'token_resetPassword',
}

export type UserAlias =
    {
        kind: UserAliasKind.email;
        email: string;
    } | {
        kind: UserAliasKind.facebookId;
        facebookId: string;
    };

export type UserEvidence =
    {
        kind: UserEvidenceKind.token_resetPassword;
        resetPasswordToken: string;
        expireTime: number;
    };