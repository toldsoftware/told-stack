import { AccountTable, SessionInfo_Client, UserAlias, SessionInfo, UserPermission, UserEvidence, UserAliasKind, UserEvidenceKind } from "../config/types";
import { TableBinding } from "../../types/functions";
import { createSessonToken_server, createUserId_server, createEvidenceToken } from "../config/account-ids";
import { encodeTableKey } from "../../utils/encode-key";
import { saveTableEntities, loadTableEntity, findTableEntities } from "../../utils/azure-storage-binding/tables-sdk";
import { EmailProvider } from "../../providers/email-provider";
import { createMessage_resetPasswordEmail } from "../../messages/messages";
import { AccountServerConfig } from "../config/server-config";

function encodeAlias(kind: UserAliasKind, alias: string) {
    return `alias-${kind}-${alias}`;
}

function encodeEvidence(kind: UserEvidenceKind, evidence: string) {
    return `evidence-${kind}-${evidence}`;
}

export class AccountManager {
    constructor(private config: AccountServerConfig, private emailProvider: EmailProvider) { }

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

    async createNewUser() {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const userId = createUserId_server();
        await saveTableEntities(accountTableBinding, {
            PartitionKey: userId,
            RowKey: 'user',
        });

        return { userId };
    }

    private async storeUserAlias(userId: string, alias: string, data: UserAlias) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_AccountTable();
        const aliasEncoded = encodeAlias(data.kind, alias);

        // Verify Alias doesn't exist already
        const lookup = await loadTableEntity<AccountTable>(accountTableBinding, aliasEncoded, 'lookup');
        if (lookup && lookup.userId !== userId) {
            throw 'The User Credential Already points to a Different User';
        }

        await saveTableEntities(accountTableBinding,
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
            });
    }

    private async storeUserEvidence(userId: string, evidence: string, data: UserEvidence) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_AccountTable();
        const evidenceEncoded = encodeEvidence(data.kind, evidence);

        await saveTableEntities(accountTableBinding,
            {
                // Credentials List (Store actual credential here)
                PartitionKey: userId,
                RowKey: evidenceEncoded,
                userId: userId,
                userEvidence: data,
            });
    }

    private async lookupUserAliasEntity(kind: UserAliasKind, alias: string): Promise<AccountTable> {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const aliasEncoded = encodeAlias(kind, alias);

        const lookup = await loadTableEntity<AccountTable>(accountTableBinding, aliasEncoded, 'lookup');
        const entity = lookup && await loadTableEntity<AccountTable>(accountTableBinding, lookup.userId, aliasEncoded);
        if (entity.isDisabled) { return null; }
        return entity;
    }

    private async lookupUserEvidenceEntity(userId: string, kind: UserEvidenceKind, evidence: string): Promise<AccountTable> {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const evidenceEncoded = encodeEvidence(kind, evidence);

        const entity = await loadTableEntity<AccountTable>(accountTableBinding, userId, evidenceEncoded);
        if (entity.isDisabled) { return null; }
        return entity;
    }

    private async disableEvidenceOfKind(userId: string, kind: UserEvidenceKind) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_AccountTable();
        const evidenceEncoded_prefix = encodeEvidence(kind, '');

        const entities = await findTableEntities<AccountTable>(accountTableBinding, userId, evidenceEncoded_prefix);
        const entitiesDisabled = entities.map(x => ({ PartitionKey: x.PartitionKey, RowKey: x.RowKey, isDisabled: false }));
        await saveTableEntities(accountTableBinding, ...entitiesDisabled);
    }

    async canUserClaimEmail(userId: string, email: string) {
        const emailEntity = await this.lookupUserAliasEntity(UserAliasKind.email, email);
        return !emailEntity || emailEntity.userId === userId;
    }

    async storeAlias_email_unverified(userId: string, email: string) {
        await this.storeUserAlias(userId, email, {
            kind: UserAliasKind.email,
            email,
        });
    }

    async sendEmail_resetPassword(email: string): Promise<{ isEmailSending: boolean, error?: string }> {
        const emailProvider = this.emailProvider;

        // Get UserId
        const c = await this.lookupUserAliasEntity(UserAliasKind.email, email);

        // Do not send this information to the client (Instead, tell user that if email exists it will be sent and offer customer support)
        // Do not send email to unknown emails (could be used to force server to spam)
        if (!c) {
            return {
                isEmailSending: false,
                error: 'Email not Found',
            }
        }

        // Disable old tokens
        this.disableEvidenceOfKind(c.userId, UserEvidenceKind.token_resetPassword);

        // Create new token
        const resetPasswordToken = createEvidenceToken();
        const expireTime = Date.now() + this.config.resetPasswordExpireTimeMs;

        this.storeUserEvidence(c.userId, resetPasswordToken, {
            kind: UserEvidenceKind.token_resetPassword,
            resetPasswordToken,
            expireTime,
        });

        const resetPasswordUrl = this.config.getResetPasswordUrl(resetPasswordToken);
        const cancelUrl = this.config.getCancelResetPasswordUrl(resetPasswordToken);
        await emailProvider.sendEmail(email, createMessage_resetPasswordEmail(email, resetPasswordUrl, cancelUrl, expireTime));

        return { isEmailSending: true };
    }
}

// TODO: Verify User Credential (Login)
// TODO: User Authorization (Roles?)
