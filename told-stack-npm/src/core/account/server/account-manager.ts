import { AccountTable, SessionInfo_Client, UserAlias, SessionInfo, AccountPermission, UserEvidence, UserAliasKind, UserEvidenceKind, getAccountPermissions_userEvidenceKind, getAccountPermissions_userAlias } from "../config/types";
import { TableBinding } from "../../types/functions";
import { createSessonToken_server, createUserId_server, createEvidenceToken } from "../config/account-ids";
import { encodeTableKey } from "../../utils/encode-key";
import { saveTableEntities_merge, loadTableEntity, findTableEntities } from "../../utils/azure-storage-binding/tables-sdk";
import { EmailProvider } from "../../providers/email-provider";
import { createMessage_resetPasswordEmail } from "../../messages/messages";
import { AccountServerConfig } from "../config/server-config";
import { unique_values } from "../../utils/objects";
import { SessionManager } from "./session-manager";
import { Public } from "../../azure-functions/function-base";

export function encodeAlias(kind: UserAliasKind, alias: string) {
    return encodeURIComponent(`alias-${kind}-${alias}`);
}

export function encodeEvidence(kind: UserEvidenceKind, evidence: string) {
    return encodeURIComponent(`evidence-${kind}-${evidence}`);
}

export class AccountManager {
    constructor(public config: AccountServerConfig, private sessionManager: Public<SessionManager>) { }

    private async verifyUserExists(userId: string) {
        if (!this.doesUserExist(userId)) {
            throw 'The User does not Exist';
        }
    }

    async doesUserExist(userId: string) {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const u = loadTableEntity(accountTableBinding, userId, 'user');
        return !!u;
    }

    async createNewUser(oldSessionToken?: string) {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const userId = createUserId_server();
        await saveTableEntities_merge(accountTableBinding, {
            PartitionKey: userId,
            RowKey: 'user',
        });

        return await this.sessionManager.createNewSession(userId, [AccountPermission.SetCredentials], [], oldSessionToken);
    }

    private async storeUserAlias(userId: string, alias: string, data: UserAlias) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_AccountTable();
        const aliasEncoded = encodeAlias(data.kind, alias);

        // Verify Alias doesn't exist already
        const lookup = await loadTableEntity<AccountTable>(accountTableBinding, aliasEncoded, 'lookup');
        if (lookup && lookup.userId !== userId) {
            throw 'The User Alias Already points to a Different User';
        }

        await saveTableEntities_merge(accountTableBinding,
            {
                // Alias UserId Lookup (Don't store data here)
                PartitionKey: aliasEncoded,
                RowKey: 'lookup',
                userId: userId,
            }, {
                // User Alias List (Store data here)
                PartitionKey: userId,
                RowKey: aliasEncoded,
                userId: userId,
                userAlias: data,
                usageCount: 0,
            });
    }

    public async storeUserEvidence(userId: string, evidence: string, data: UserEvidence, options = { shouldDisableOtherEvidenceOfSameKind: true }) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_AccountTable();
        const evidenceEncoded = encodeEvidence(data.kind, evidence);

        if (!options || options.shouldDisableOtherEvidenceOfSameKind) {
            this.disableEvidenceOfKind(userId, data.kind);
        }

        await saveTableEntities_merge(accountTableBinding,
            {
                // Credentials List (Store actual credential here)
                PartitionKey: userId,
                RowKey: evidenceEncoded,
                userId: userId,
                userEvidence: data,
                usageCount: 0,
            });
    }

    public async lookupUserAliasEntity(kind: UserAliasKind, alias: string, options = { shouldIncrementUsage: false, shouldIgnoreDisabled: false }): Promise<AccountTable> {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const aliasEncoded = encodeAlias(kind, alias);

        const lookup = await loadTableEntity<AccountTable>(accountTableBinding, aliasEncoded, 'lookup');
        const entity = lookup && await loadTableEntity<AccountTable>(accountTableBinding, lookup.userId, aliasEncoded);

        if (entity && options && options.shouldIncrementUsage) {
            entity.usageCount++;

            await saveTableEntities_merge(accountTableBinding, {
                PartitionKey: lookup.userId,
                RowKey: aliasEncoded,
                usageCount: entity.usageCount
            });
        }

        if (!options.shouldIgnoreDisabled && entity.isDisabled) { return null; }
        return entity;
    }

    private async lookupUserEvidenceEntity(userId: string, kind: UserEvidenceKind, evidence: string, options = { shouldIncrementUsage: false }): Promise<AccountTable> {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const evidenceEncoded = encodeEvidence(kind, evidence);

        const entity = await loadTableEntity<AccountTable>(accountTableBinding, userId, evidenceEncoded);

        if (entity && options && options.shouldIncrementUsage) {
            entity.usageCount++;

            await saveTableEntities_merge(accountTableBinding, {
                PartitionKey: userId,
                RowKey: evidenceEncoded,
                usageCount: entity.usageCount
            });
        }

        if (!entity
            || entity.isDisabled
            || Date.now() > entity.userEvidence.expireTime
            || entity.usageCount > entity.userEvidence.maxUsages
        ) {
            return null;
        }

        return entity;
    }

    private async disableEvidenceOfKind(userId: string, kind: UserEvidenceKind) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_AccountTable();
        const evidenceEncoded_prefix = encodeEvidence(kind, '');

        const entities = await findTableEntities<AccountTable>(accountTableBinding, userId, evidenceEncoded_prefix);
        const entitiesDisabled = entities.map(x => ({ PartitionKey: x.PartitionKey, RowKey: x.RowKey, isDisabled: false }));
        await saveTableEntities_merge(accountTableBinding, ...entitiesDisabled);
    }

    async canUserClaimEmail(userId: string, email: string) {
        const emailEntity = await this.lookupUserAliasEntity(UserAliasKind.email, email);
        return !emailEntity || emailEntity.userId === userId;
    }

    async storeAlias_email_unverified(userId: string, email: string) {
        await this.storeUserAlias(userId, email, {
            kind: UserAliasKind.email,
            email,
            isVerified: false,
        });
    }

    // async storeAlias_email_verified(userId: string, email: string) {
    //     await this.storeUserAlias(userId, email, {
    //         kind: UserAliasKind.email,
    //         email,
    //         isVerified: true,
    //     });
    // }

    // Verified Externally
    // TODO: Use User Evidence for Email Verification (Create User Account upon send Verification Email)
    async verifyEmail(userId: string, email: string, oldSessionToken?: string, options = { shouldCreateSession: true }) {
        await this.storeUserAlias(userId, email, {
            kind: UserAliasKind.email,
            email,
            isVerified: true,
        });

        const accountPermissions = [AccountPermission.SetCredentials];
        const userAuthorizations = unique_values<string>([]);
        if (!options.shouldCreateSession) {
            return await this.sessionManager.createNewSession(userId, accountPermissions, userAuthorizations, oldSessionToken);
        }
        else{
            return null;
        }
    }

    async login(alias: { value: string, kind: UserAliasKind }, evidence?: { value: string, kind: UserEvidenceKind }, oldSessionToken?: string) {
        const aliasEntity = await this.lookupUserAliasEntity(alias.kind, alias.value, { shouldIncrementUsage: true, shouldIgnoreDisabled: false });
        const userId = aliasEntity.userId;
        const evidenceEntity = evidence && await this.lookupUserEvidenceEntity(userId, evidence.kind, evidence.value, { shouldIncrementUsage: true });
        const accountPermissions = unique_values([
            ...getAccountPermissions_userAlias(aliasEntity.userAlias),
            ...evidenceEntity && getAccountPermissions_userEvidenceKind(evidenceEntity.userEvidence.kind) || [],
        ]);

        // TODO: User Authorizations
        const userAuthorizations = unique_values<string>([]);

        return await this.sessionManager.createNewSession(userId, accountPermissions, userAuthorizations, oldSessionToken);
    }
}
