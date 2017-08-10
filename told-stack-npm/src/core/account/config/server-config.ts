import { TableBinding, HttpBinding } from "../../types/functions";
import { createTableBinding } from "../../azure-functions/function-base";
import { SessionTable, AccountTable } from "./types";

export interface FunctionTemplateConfig {
    getBinding_http: (trigger: { sessionToken: string }) => HttpBinding;
    getBinding_SessionTable_fromSessionToken: (trigger: { sessionToken: string }) => TableBinding;
}

export const sessionTokenTrigger = {
    sessionToken: '',
}

export interface ServerConfigType {

}

export class AccountServerConfig implements ServerConfigType, FunctionTemplateConfig {

    resetPasswordExpireTimeMs = this.options.resetPasswordExpireTimeMs || 24 * 60 * 60 * 1000;
    storageConnection = this.options.storageConnection_appSettingName || 'AZURE_STORAGE_CONNECTION_STRING';


    constructor(private options: {
        getUrl_resetPassword: (token: string) => string,
        getUrl_cancelResetPassword: (token: string) => string,
        storageConnection_appSettingName?: string,
        resetPasswordExpireTimeMs?: number,
    }) { }

    getBinding_http = (trigger: { sessionToken: string }): HttpBinding => {
        return {
            route: `api/account/create-session/${trigger.sessionToken}`,
        };
    }

    getBinding_SessionTable_out = (): TableBinding => {
        return {
            tableName: 'session',
            partitionKey: undefined,
            rowKey: undefined,
            connection: this.storageConnection
        };
    }
    binding_sessionTable_out = createTableBinding<SessionTable|SessionTable[]>(this.getBinding_SessionTable_out);


    getBinding_SessionTable_fromSessionToken = (trigger: { sessionToken: string }): TableBinding => {
        return {
            tableName: 'session',
            partitionKey: `${trigger.sessionToken}`,
            rowKey: `session-user`,
            connection: this.storageConnection
        };
    }
    binding_sessionTable_fromSessionToken = createTableBinding<SessionTable>(this.getBinding_SessionTable_fromSessionToken, { sessionToken: '' });

    getBinding_AccountTable = (): TableBinding => {
        return {
            tableName: 'user',
            connection: this.storageConnection,
            partitionKey: undefined,
            rowKey: undefined,
        };
    }
    binding_accountTable_out = createTableBinding<AccountTable|AccountTable[]>(this.getBinding_AccountTable);
    

    getUrl_resetPassword = this.options.getUrl_resetPassword;
    getUrl_cancelResetPassword = this.options.getUrl_cancelResetPassword;

    // getBinding_UserTable = (trigger: { userId: string }): TableBinding => {
    //     return {
    //         tableName: 'account',
    //         partitionKey: `${trigger.userId}`,
    //         rowKey: `user-session`,
    //         connection: this.storageConnection
    //     };
    // }
}