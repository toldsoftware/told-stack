import { AccountTable, SessionInfo_Client, UserAlias, SessionInfo, AccountPermission, UserEvidence, UserAliasKind, UserEvidenceKind, getAccountPermissions_userEvidenceKind, getAccountPermissions_userAlias, verifyAccountPermission, getAliasValue_orJson } from "../config/types";
import { createSessonToken_server, createUserId_server, createEvidenceToken } from "../config/account-ids";
import { encodeTableKey } from "../../utils/encode-key";
import { saveTableEntities_merge, loadTableEntity, findTableEntities } from "../../utils/azure-storage-binding/tables-sdk";
import { EmailProvider } from "../../providers/email-provider";
import { createMessage_resetPasswordEmail } from "../../messages/messages";
import { AccountServerConfig } from "../config/server-config";
import { unique_values } from "../../utils/objects";
import { SessionManager } from "./session-manager";
import { Public } from "../../azure-functions/function-base";
import { EmailMessage } from "../../email/config/types";
import { SessionAuthenticator } from "./session-authenticator";
import { hashPassword } from "../../utils/password";
import { randHex } from "../../utils/rand";

export function encodeAlias(kind: UserAliasKind, alias: string) {
    return encodeURIComponent(`alias-${kind}-${alias}`);
}

export function encodeEvidence(kind: UserEvidenceKind, evidence: string) {
    return encodeURIComponent(`evidence-${kind}-${evidence}`);
}

export interface EmailSender {
    sendEmail(message: EmailMessage): Promise<void>;
}

export class AccountManager {
    constructor(
        public config: AccountServerConfig,
        private sessionAuthenticator: Public<SessionAuthenticator>,
        private sessionManager: Public<SessionManager>,
        private emailSender: EmailSender,
        private debug: { log: typeof console.log }
    ) { }

    private async verifyUserExists(userId: string) {
        if (!this.doesUserExist(userId)) {
            throw 'The User does not Exist';
        }
    }

    async doesUserExist(userId: string) {
        const accountTableBinding = this.config.getBinding_accountTable();
        const u = loadTableEntity(accountTableBinding, userId, 'user');
        return !!u;
    }

    async createNewUser(oldSessionToken?: string) {
        const accountTableBinding = this.config.getBinding_accountTable();
        const userId = createUserId_server();
        await saveTableEntities_merge(accountTableBinding, {
            PartitionKey: userId,
            RowKey: 'user',
        });

        return await this.sessionManager.createNewSession(userId, [AccountPermission.SetCredentials], [], oldSessionToken);
    }

    private async storeUserAlias(userId: string, alias: string, data: UserAlias) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_accountTable();
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

    public async storeUserEvidence(userId: string, evidence: string, data: UserEvidence, sessionToken_request: string, options = { shouldDisableOtherEvidenceOfSameKind: true }) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_accountTable();
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
                sessionToken_request
            });
    }

    public async lookupUserAliasEntity(kind: UserAliasKind, alias: string, options = { shouldIncrementUsage: false, shouldIgnoreDisabled: false }): Promise<AccountTable> {
        this.debug.log('lookupUserAliasEntity START');

        const accountTableBinding = this.config.getBinding_accountTable();
        const aliasEncoded = encodeAlias(kind, alias);

        this.debug.log('lookupUserAliasEntity loadTableEntity', { kind, alias, aliasEncoded, accountTableBinding });
        const lookup = await loadTableEntity<AccountTable>(accountTableBinding, aliasEncoded, 'lookup');
        const entity = lookup && await loadTableEntity<AccountTable>(accountTableBinding, lookup.userId, aliasEncoded);

        if (!entity) { this.debug.log('lookupUserAliasEntity FAIL entity not found', { kind, alias }); return null; }

        if (options && options.shouldIncrementUsage) {
            this.debug.log('lookupUserAliasEntity incrementUsage', { entity });

            entity.usageCount++;

            await saveTableEntities_merge(accountTableBinding, {
                PartitionKey: lookup.userId,
                RowKey: aliasEncoded,
                usageCount: entity.usageCount
            });
        }

        this.debug.log('lookupUserAliasEntity END', { entity });
        if (!options.shouldIgnoreDisabled && entity.isDisabled) { return null; }
        return entity;
    }

    private async lookupUserEvidenceEntity(userId: string, kind: UserEvidenceKind, evidence: string, options = { shouldIncrementUsage: false }): Promise<AccountTable> {
        this.debug.log('lookupUserEvidenceEntity START');

        const accountTableBinding = this.config.getBinding_accountTable();
        const evidenceEncoded = encodeEvidence(kind, evidence);

        this.debug.log('lookupUserEvidenceEntity loadTableEntity', { kind, accountTableBinding });
        const entity = await loadTableEntity<AccountTable>(accountTableBinding, userId, evidenceEncoded);

        if (!entity) { this.debug.log('lookupUserEvidenceEntity FAIL entity not found', { userId, kind }); return null; }

        if (options && options.shouldIncrementUsage) {
            this.debug.log('lookupUserEvidenceEntity incrementUsage', { entity });

            entity.usageCount++;

            await saveTableEntities_merge(accountTableBinding, {
                PartitionKey: userId,
                RowKey: evidenceEncoded,
                usageCount: entity.usageCount
            });
        }

        else if (entity.isDisabled) { this.debug.log('lookupUserEvidenceEntity FAIL entity disabled', { entity }); return null; }
        else if (entity.userEvidence.kind !== UserEvidenceKind.password) {
            if (Date.now() > entity.userEvidence.expireTime) { this.debug.log('lookupUserEvidenceEntity FAIL evidence expired', { entity }); return null; }
            if (entity.usageCount > entity.userEvidence.maxUsages) { this.debug.log('lookupUserEvidenceEntity FAIL evidence exhausted', { entity }); return null; }
        }

        this.debug.log('lookupUserEvidenceEntity END');
        return entity;
    }

    private async disableEvidenceOfKind(userId: string, kind: UserEvidenceKind) {
        this.verifyUserExists(userId);

        const accountTableBinding = this.config.getBinding_accountTable();
        const evidenceEncoded_prefix = encodeEvidence(kind, '');

        const entities = await findTableEntities<AccountTable>(accountTableBinding, userId, evidenceEncoded_prefix);
        const entitiesDisabled = entities.map(x => ({ PartitionKey: x.PartitionKey, RowKey: x.RowKey, isDisabled: true }));
        await saveTableEntities_merge(accountTableBinding, ...entitiesDisabled);
    }

    // Throttle
    private async logLoginAttempts(message: string, aliasKindValue: { value: string, kind: UserAliasKind | 'userId' }, sessionToken: string, userId: string, evidence: { value: string, kind: UserEvidenceKind }) {
        this.debug.log('logLoginAttempts START');

        const tableBinding = this.config.getBinding_accountAttemptTable();

        this.debug.log('logLoginAttempts get aliasEncoded');
        const aliasEncoded = aliasKindValue && encodeAlias(aliasKindValue.kind as UserAliasKind, aliasKindValue.value) || 'alias-[NULL]';

        this.debug.log('logLoginAttempts clean evidence');
        if (evidence) {
            evidence = { ...evidence };
            evidence.value = this.cleanEvidenceForLog(evidence.value);
        }

        this.debug.log('logLoginAttempts saveTableEntities');
        await saveTableEntities_merge(tableBinding, {
            PartitionKey: aliasEncoded,
            RowKey: '' + Date.now() + '' + randHex(8),
            message,
            sessionToken,
            userId,
            evidence,
        });

        this.debug.log('logLoginAttempts END');
    }

    private cleanEvidenceForLog(value: string) {
        if (!value) {
            return '[NULL]';
        }

        if (!value.length || !value.substr) {
            this.debug.log('cleanEvidenceForLog FAIL value not a string', value);
            return '[NOT STRING]';
        }

        if (value.length < 50) {
            return '[HIDDEN]';
        } else {
            return value.substr(0, 32) + '...';
        }
    }

    private getAliasKindValue(alias: UserAlias) {
        if (!alias) { return null; }
        return { kind: alias.kind, value: getAliasValue_orJson(alias) }
    }

    private async throttleLoginAttempts(userId: string, aliasEntity: AccountTable, evidence: { value: string, kind: UserEvidenceKind }, sessionToken: string) {
        await this.logLoginAttempts('LoginAttempt', this.getAliasKindValue(aliasEntity.userAlias), sessionToken, userId, evidence);

        // TODO: Implement Throttle
        return false;
    }

    private async throttleVerifyEmailAttempts(email: string, sessionToken: string) {
        await this.logLoginAttempts('VerifyEmailAttempt', { kind: UserAliasKind.email, value: email }, sessionToken, null, null);

        // TODO: Implement Throttle
        return false;
    }

    // Login
    async login(alias: { value: string, kind: UserAliasKind }, evidence?: { value: string, kind: UserEvidenceKind }, oldSessionToken?: string) {
        this.debug.log('login START', { alias, oldSessionToken });

        const aliasEntity = await this.lookupUserAliasEntity(alias.kind, alias.value, { shouldIncrementUsage: true, shouldIgnoreDisabled: false });
        if (!aliasEntity) {
            this.debug.log('login FAIL aliasEntity not found', { alias });
            await this.logLoginAttempts('LoginAttempt FAILED: alias not found', alias, oldSessionToken, null, evidence);
            return null;
        }

        const userId = aliasEntity.userId;

        // Hash evidences that are required
        if (evidence && evidence.kind === UserEvidenceKind.password) {
            evidence.value = await this.getPasswordHash(userId, evidence.value);
        }

        if (await this.throttleLoginAttempts(userId, aliasEntity, evidence, oldSessionToken)) { return null; }

        return await this.login_userId(userId, evidence, oldSessionToken, aliasEntity.userAlias);
    }

    private async login_userId(userId: string, evidence: { value: string, kind: UserEvidenceKind }, oldSessionToken: string, userAlias: UserAlias = null) {
        const evidenceEntity = evidence && await this.lookupUserEvidenceEntity(userId, evidence.kind, evidence.value, { shouldIncrementUsage: true });

        if (evidence && !evidenceEntity) {
            this.debug.log('login FAIL evidenceEntity not found', { userId });
            await this.logLoginAttempts('LoginAttempt FAILED: evidence not found', this.getAliasKindValue(userAlias) || { kind: 'userId', value: userId }, oldSessionToken, null, evidence);
            return null;
        }

        const accountPermissions = unique_values([
            ...userAlias && getAccountPermissions_userAlias(userAlias) || [],
            ...evidenceEntity && getAccountPermissions_userEvidenceKind(evidenceEntity.userEvidence.kind) || [],
        ]);

        // TODO: User Authorizations
        const userAuthorizations = unique_values<string>([]);

        const sessionInfo = await this.sessionManager.createNewSession(userId, accountPermissions, userAuthorizations, oldSessionToken);

        this.debug.log('login END', { sessionInfo });
        return sessionInfo;
    }

    // Emails
    private formatEmail(email: string) {
        return (email || '').toLowerCase();
    }

    // Deprecated?
    async canUserClaimEmail(userId: string, email: string) {
        email = this.formatEmail(email);

        const emailEntity = await this.lookupUserAliasEntity(UserAliasKind.email, email, { shouldIgnoreDisabled: true, shouldIncrementUsage: false });
        return !emailEntity || emailEntity.userId === userId;
    }

    async storeAlias_email_unverified(userId: string, email: string) {
        email = this.formatEmail(email);

        await this.storeUserAlias(userId, email, {
            kind: UserAliasKind.email,
            email,
            isVerified: false,
        });
    }

    async storeAlias_email_verified(userId: string, email: string) {
        email = this.formatEmail(email);

        await this.storeUserAlias(userId, email, {
            kind: UserAliasKind.email,
            email,
            isVerified: true,
        });
    }

    async sendEmailVerification_createUserIfNone(sessionToken_request: string, email: string, generateMessage: (verificationToken: string) => EmailMessage) {
        if (!email) { return { error: 'Missing Email' }; }
        email = this.formatEmail(email);

        this.debug.log('sendEmailVerification_createUserIfNone START');

        const verificationToken = createEvidenceToken();
        const expireTime = Date.now() + this.config.emailTokenExpireTimeMs;

        if (await this.throttleVerifyEmailAttempts(email, sessionToken_request)) { return { error: 'Max Attempts Exceeded: Please Wait and Try Again Later' }; }

        this.debug.log('sendEmailVerification_createUserIfNone lookupUserAliasEntity');
        const user = await this.lookupUserAliasEntity(UserAliasKind.email, email, { shouldIgnoreDisabled: true, shouldIncrementUsage: false });
        let userId = user && user.userId;

        if (!userId) {
            this.debug.log('sendEmailVerification_createUserIfNone createNewUser');
            const s = await this.createNewUser(sessionToken_request);
            userId = s.userId;

            await this.storeAlias_email_unverified(userId, email);
            sessionToken_request = s.sessionToken;
        }

        this.debug.log('sendEmailVerification_createUserIfNone storeUserEvidence');
        await this.storeUserEvidence(userId, verificationToken, {
            kind: UserEvidenceKind.token_verifyEmail,
            verificationToken,
            expireTime,
            maxUsages: 1,
        }, sessionToken_request, { shouldDisableOtherEvidenceOfSameKind: true });

        this.debug.log('sendEmailVerification_createUserIfNone sendEmail');
        const message = generateMessage(verificationToken);
        await this.emailSender.sendEmail(message);

        this.debug.log('sendEmailVerification_createUserIfNone END');

        return { error: undefined };
    }

    async verifyEmail(sessionToken_request: string, email: string, verificationToken: string) {
        email = this.formatEmail(email);

        const result = await this.login({ kind: UserAliasKind.email, value: email }, { kind: UserEvidenceKind.token_verifyEmail, value: verificationToken }, sessionToken_request);

        // Mark Email as verified
        if (result) {
            await this.storeAlias_email_verified(result.userId, email);
        }

        return result;
    }

    // Password
    async getPasswordHash(userId: string, password: string) {
        // userId is a sufficient salt source
        const userSalt = userId;
        return await hashPassword(password, userSalt);
    }

    async loginEmailPassword(email: string, password: string, sessionToken_request: string) {
        email = this.formatEmail(email);

        const sessionInfo = await this.login(
            { kind: UserAliasKind.email, value: email },
            { kind: UserEvidenceKind.password, value: password },
            sessionToken_request);

        return sessionInfo;
    }

    async changePassword(sessionToken: string, password: string) {
        this.debug.log('changePassword START', { sessionToken });

        if (!password) {
            this.debug.log('changePassword FAIL No Password', { sessionToken });
            //return { error: 'No Password' };
            return null;
        }
        if (!this.sessionAuthenticator.authenticateSession_accountPermission(AccountPermission.SetCredentials)) {
            this.debug.log('changePassword FAIL Insufficient Account Permissions', { sessionToken });
            // return { error: 'Insufficient Account Permissions: Cannot change password' };
            return null;
        }

        this.debug.log('changePassword getUserId', { sessionToken });
        const userId = this.sessionAuthenticator.getUserId();
        const passwordHash = await this.getPasswordHash(userId, password);

        this.debug.log('changePassword save password', { sessionToken });
        const evidence: UserEvidence = { kind: UserEvidenceKind.password, passwordHash };
        await this.storeUserEvidence(userId, passwordHash, evidence, sessionToken, { shouldDisableOtherEvidenceOfSameKind: true });

        this.debug.log('changePassword login with password', { sessionToken });
        const sessionInfo = await this.login_userId(userId, { kind: evidence.kind, value: evidence.passwordHash }, sessionToken);

        this.debug.log('changePassword END', { sessionInfo });
        return sessionInfo;
    }
}
