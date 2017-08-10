import { AccountManager } from "./account-manager";
import { EmailProvider } from "../../providers/email-provider";
import { createEvidenceToken } from "../config/account-ids";
import { UserAliasKind, UserEvidenceKind } from "../config/types";
import { createMessage_resetPasswordEmail } from "../../messages/messages";

export class AccountManagerEmail {
    constructor(private accountManager: AccountManager, private emailProvider: EmailProvider) { }

    async sendEmail_resetPassword(email: string): Promise<{ isEmailSending: boolean, error?: string }> {
        const emailProvider = this.emailProvider;

        // Get UserId
        const c = await this.accountManager.lookupUserAliasEntity(UserAliasKind.email, email);

        // Do not send this information to the client (Instead, tell user that if email exists it will be sent and offer customer support)
        // Do not send email to unknown emails (could be used to force server to spam)
        if (!c) {
            return {
                isEmailSending: false,
                error: 'Email not Found',
            }
        }

        // Create new token
        const resetPasswordToken = createEvidenceToken();
        const expireTime = Date.now() + this.accountManager.config.resetPasswordExpireTimeMs;

        this.accountManager.storeUserEvidence(c.userId, resetPasswordToken, {
            kind: UserEvidenceKind.token_resetPassword,
            resetPasswordToken,
            expireTime,
            maxUsages: 1,
        }, { shouldDisableOtherEvidenceOfSameKind: true });

        const resetPasswordUrl = this.accountManager.config.getUrl_resetPassword(resetPasswordToken);
        const cancelUrl = this.accountManager.config.getUrl_cancelResetPassword(resetPasswordToken);
        await emailProvider.sendEmail(email, createMessage_resetPasswordEmail(email, resetPasswordUrl, cancelUrl, expireTime));

        return { isEmailSending: true };
    }
}