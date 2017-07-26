import { AccountTable, SessionInfo_Client, UserCredential, SessionInfo, UserAccess, UserCredentialKind } from "../config/types";
import { TableBinding } from "../../types/functions";
import { createSessonToken_server, createUserId_server, createVerificationToken } from "../config/account-ids";
import { encodeTableKey } from "../../utils/encode-key";
import { saveTableEntities, loadTableEntity } from "../../utils/azure-storage-binding/tables-sdk";
import { EmailProvider } from "../../providers/email-provider";
import { createMessage_verificationEmail } from "../../messages/messages";
import { AccountServerConfig } from "../config/server-config";

export class AccountManager {
    constructor(private config: AccountServerConfig, private emailProvider: EmailProvider) { }

    createNewUserAndSession(sessionInfo: SessionInfo_Client): SessionInfo {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const sessionToken = createSessonToken_server();
        const userId = createUserId_server();

        saveTableEntities(accountTableBinding,
            {
                // Session User
                PartitionKey: sessionToken,
                RowKey: 'session-user',
                sessionToken,
                userId,
                isAnonymous: false,
                fromSessionToken: sessionInfo.sessionToken,
            }, {
                // User Sessions
                PartitionKey: userId,
                RowKey: sessionToken,
                sessionToken,
                userId,
                isAnonymous: false,
                fromSessionToken: sessionInfo.sessionToken,
            }, {
                // User List Partition
                PartitionKey: 'users',
                RowKey: userId,
                userId,
                sessionToken: undefined,
                isAnonymous: undefined,
                fromSessionToken: undefined,
            });

        return {
            sessionToken,
            userId,
            isAnonymous: false,
        };
    }

    private storeCredential(userId: string, cred: UserCredential, kind: UserCredentialKind, lookup: string) {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const lookupEncoded = encodeTableKey(`${kind}:${lookup}`);

        saveTableEntities(accountTableBinding,
            {
                // Credential Lookup
                PartitionKey: lookupEncoded,
                RowKey: 'lookup',
                userCredential: cred,
                userId: userId,
                sessionToken: undefined,
                isAnonymous: undefined,
                fromSessionToken: undefined,
            }, {
                // User Credentials List
                PartitionKey: userId,
                RowKey: lookupEncoded,
                userCredential: cred,
                userId: userId,
                sessionToken: undefined,
                isAnonymous: undefined,
                fromSessionToken: undefined,
            });
    }

    private async  lookupCredential(kind: UserCredentialKind, lookup: string) {
        const accountTableBinding = this.config.getBinding_AccountTable();
        const lookupEncoded = encodeTableKey(`${kind}:${lookup}`);
        return await loadTableEntity<AccountTable>(accountTableBinding, lookupEncoded, 'lookup');
    }

    storeCredential_email_unverified(userId: string, email: string) {
        this.storeCredential(userId, {
            kind: UserCredentialKind.email_unverified,
            access: UserAccess.None_SendEmailVerification,
            email,
        }, UserCredentialKind.email_unverified, email);
    }

    async sendEmailVerification(email: string) {
        const emailProvider = this.emailProvider;

        // Get UserId
        const c = await this.lookupCredential(UserCredentialKind.email_unverified, email);

        if (!c) {
            throw 'Unverified Email not Found: ' + email;
        }

        const verificationToken = createVerificationToken();
        this.storeCredential(c.userId, {
            kind: UserCredentialKind.email_verification,
            access: UserAccess.Full_CreatePassword,
            email,
            verificationToken,
        }, UserCredentialKind.email_verification, email);

        await emailProvider.sendEmail(email, createMessage_verificationEmail(email, verificationToken));
    }
}

// TODO: Verify User Credential (Login)
// TODO: User Authorization (Roles?)
