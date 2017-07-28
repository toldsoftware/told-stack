import { AccountServerConfig } from "../config/server-config";
import { EmailProvider } from "../../providers/email-provider";

export class TestConfig {
    serverConfig: AccountServerConfig = new AccountServerConfig({
        getUrl_resetPassword: (token) => `/resetPassword/${token}`,
        getUrl_cancelResetPassword: (token) => `/cancelResetPassword/${token}`,
    });

    emailProvider: EmailProvider = new EmailProvider({});
}