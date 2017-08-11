import { PasswordHash } from "../../utils/password";

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

    isVerified?: boolean;
    isDisabled?: boolean;
}

export function verifyAccountPermission(actualPermissions: AccountPermission[], requiredPermission: AccountPermission) {
    return actualPermissions.indexOf(AccountPermission.Full) >= 0
        || actualPermissions.indexOf(requiredPermission) >= 0;
}

export enum AccountPermission {
    None = '',
    SendEmail_ResetPassword = 'SendEmail_ResetPassword',
    SetCredentials = 'SetCredentials',
    Full = 'Full',
}

export function getAccountPermissions_userAlias(alias: UserAlias): AccountPermission[] {
    switch (alias.kind) {
        case UserAliasKind.facebookId:
            return [AccountPermission.Full];

        case UserAliasKind.email:
            //if (!alias.isVerified) {
            return [AccountPermission.SendEmail_ResetPassword];
        // } else {
        //     return [AccountPermission.SetCredentials];
        // }
        default:
            return [];
    }
}

export function getAccountPermissions_userEvidenceKind(kind: UserEvidenceKind): AccountPermission[] {
    switch (kind) {
        case UserEvidenceKind.password:
            return [AccountPermission.Full];

        case UserEvidenceKind.token_verifyEmail:
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
    token_verifyEmail = 'token_verifyEmail',
    token_resetPassword = 'token_resetPassword',
}

export type UserAlias =
    {
        kind: UserAliasKind.email;
        email: string;
        isVerified: boolean;
    } | {
        kind: UserAliasKind.facebookId;
        facebookId: string;
    };

export function getAliasValue_orJson(alias: UserAlias) {
    switch (alias.kind) {
        case UserAliasKind.email:
            return alias.email;
        case UserAliasKind.facebookId:
            return alias.facebookId;
        default:
            return JSON.stringify(alias || {});
    }
}

export type UserEvidence =
    {
        kind: UserEvidenceKind.password;
        passwordHash: PasswordHash;
    } | {
        kind: UserEvidenceKind.token_verifyEmail;
        verificationToken: string;
        expireTime: number;
        maxUsages: 1;
    } | {
        kind: UserEvidenceKind.token_resetPassword;
        resetPasswordToken: string;
        expireTime: number;
        maxUsages: 1;
    };