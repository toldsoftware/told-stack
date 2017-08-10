import { createTest } from "../../../core/testing/integration-testing";
import { TestConfig } from "./_config";
import { AccountManager, encodeAlias } from "../server/account-manager";
import { loadSessionTableEntity, loadAccountTableEntity } from "./_helpers";
import { UserAliasKind, AccountPermission } from "../config/types";
import { SessionAuthenticator } from "../server/session-authenticator";

export const can_add_email_alias = createTest<TestConfig>((testConfig) => ({
    name: `Can Add Email Alias to Existing User`,
    run: async (testContext) => {
        const accountManager = new AccountManager(testConfig.serverConfig, testConfig.emailProvider);
        const sessionInfo = await accountManager.createNewUser('s_anon_' + Date.now());

        // Create Email Credential
        const userId = sessionInfo.userId;
        const email = `test_${Date.now()}@test.com`;
        await accountManager.storeAlias_email_unverified(userId, email);

        // Manually load data
        const l = await loadAccountTableEntity(testConfig, sessionInfo.userId, encodeAlias(UserAliasKind.email, email));
        testContext.assert('Does Credential Exist', l);
        testContext.assert('Is Correct User Id', l.userId, sessionInfo.userId);
    }
}));

export const can_use_email_alias = createTest<TestConfig>((testConfig) => ({
    name: `Can Use Email Alias to Access Existing User`,
    run: async (testContext) => {
        const accountManager = new AccountManager(testConfig.serverConfig, testConfig.emailProvider);
        const sessionInfo = await accountManager.createNewUser('s_anon_' + Date.now());

        // Create Email Credential
        const userId = sessionInfo.userId;
        const email = `test_${Date.now()}@test.com`;
        await accountManager.storeAlias_email_unverified(userId, email);

        // Login with Email
        const l = await accountManager.login({ kind: UserAliasKind.email, value: email });
        testContext.assert('Is Correct User Id', l.userId, sessionInfo.userId);
        testContext.assert('Is NOT Same Session Token', l.sessionToken !== sessionInfo.sessionToken);
    }
}));

export const can_only_send_email_reset_password = createTest<TestConfig>((testConfig) => ({
    name: `A User Alias Can Only Send Email to Reset Password`,
    run: async (testContext) => {
        const accountManager = new AccountManager(testConfig.serverConfig, testConfig.emailProvider);
        const sessionInfo = await accountManager.createNewUser('s_anon_' + Date.now());

        // Create Email Credential
        const userId = sessionInfo.userId;
        const email = `test_${Date.now()}@test.com`;
        await accountManager.storeAlias_email_unverified(userId, email);

        // Login with Email
        const l = await accountManager.login({ kind: UserAliasKind.email, value: email });

        const sessionTable = await loadSessionTableEntity(testConfig, l.sessionToken);
        const sessionAuthenticator = new SessionAuthenticator(sessionTable);

        testContext.assert('Can Send Email to Reset Password',
            await sessionAuthenticator.authenticateSession_accountPermission(
                AccountPermission.SendEmail_ResetPassword));

        testContext.assert('Can NOT Reset Password',
            !await sessionAuthenticator.authenticateSession_accountPermission(
                AccountPermission.SetCredentials));

        testContext.assert('Can NOT Access Account',
            !await sessionAuthenticator.authenticateSession_accountPermission(
                AccountPermission.Full));
    },
}));
