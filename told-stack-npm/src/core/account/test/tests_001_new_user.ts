import { createTest } from "../../../core/testing/integration-testing";
import { TestConfig } from "./_config";
import { AccountManager } from "../server/account-manager";
import { SessionAuthenticator } from "../server/session-authenticator";
import { AccountPermission } from "../config/types";
import { loadSessionTableEntity } from "./_helpers";

export const new_user = createTest<TestConfig>((testConfig) => ({
    name: `A New User Should Be Created`,
    run: async (testContext) => {
        const accountManager = new AccountManager(testConfig.serverConfig, testConfig.emailProvider);
        const sessionInfo = await accountManager.createNewUser('s_anon_' + Date.now());

        testContext.assert('Has New Session Info', sessionInfo);
        testContext.assert('Has New Session Token', sessionInfo.sessionToken);
    },
}));

export const new_user_with_session_lookup_user = createTest<TestConfig>((testConfig) => ({
    name: `The New Session Token Should Lookup Correct User`,
    run: async (testContext) => {
        const accountManager = new AccountManager(testConfig.serverConfig, testConfig.emailProvider);
        const sessionInfo = await accountManager.createNewUser('s_anon_' + Date.now());
        const sessionTable = await loadSessionTableEntity(testConfig, sessionInfo.sessionToken);
        testContext.assert('Is Correct User Id', sessionTable.userId, sessionInfo.userId);
    },
}));

export const new_user_with_session_lookup_permissions = createTest<TestConfig>((testConfig) => ({
    name: `The New Session Token Should Lookup Correct Permissions`,
    run: async (testContext) => {
        const accountManager = new AccountManager(testConfig.serverConfig, testConfig.emailProvider);
        const sessionInfo = await accountManager.createNewUser('s_anon_' + Date.now());
        const sessionTable = await loadSessionTableEntity(testConfig, sessionInfo.sessionToken);
        const sessionAuthenticator = new SessionAuthenticator(sessionTable);
        const canSetCredentials = await sessionAuthenticator.authenticateSession_accountPermission(AccountPermission.SetCredentials);
        testContext.assert('Has Permission: Can Set Credentials', canSetCredentials);
    },
}));


