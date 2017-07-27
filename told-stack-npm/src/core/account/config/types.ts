export interface SessionInfo_Client {
    sessionToken: string;
    isAnonymous: boolean;

    userId_claimed: string;
    accountPermissions_claimed: AccountPermission[];
}

export interface SessionInfo {
    sessionToken: string;
    userId: string;
    accountPermissions: AccountPermission[];
    userAuthorizations: string[];

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
    usageCount: number;

    userAlias?: UserAlias;
    userEvidence?: UserEvidence;

    isDisabled?: boolean;
}

export function verifyUserPermission(actualPermissions: AccountPermission[], requiredPermission: AccountPermission) {
    return actualPermissions.indexOf(AccountPermission.Full) >= 0
        || actualPermissions.indexOf(requiredPermission) >= 0;
}

export enum AccountPermission {
    None = '',
    SendEmail_ResetPassword = 'SendEmail_ResetPassword',
    SetCredentials = 'SetCredentials',
    Full = 'Full',
}

export function getAccountPermissions_userAliasKind(kind: UserAliasKind): AccountPermission[] {
    switch (kind) {
        case UserAliasKind.facebookId:
            return [AccountPermission.Full];

        case UserAliasKind.email:
            return [AccountPermission.SendEmail_ResetPassword];

        default:
            return [];
    }
}

export function getAccountPermissions_userEvidenceKind(kind: UserEvidenceKind): AccountPermission[] {
    switch (kind) {
        case UserEvidenceKind.password:
            return [AccountPermission.Full];

        case UserEvidenceKind.token_resetPassword:
            return [AccountPermission.SetCredentials];

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
        maxUsages: 1;
    };