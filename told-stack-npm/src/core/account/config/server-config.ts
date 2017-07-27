import { TableBinding, HttpBinding } from "../../types/functions";
export * from './types';

export interface FunctionTemplateConfig {
    getBinding_http: (trigger: { sessionToken: string }) => HttpBinding;
    getBinding_SessionTable: (trigger: { sessionToken: string }) => TableBinding;
}

export const sessionTokenTrigger = {
    sessionToken: '',
}

export interface ServerConfigType {

}

export class AccountServerConfig implements ServerConfigType, FunctionTemplateConfig {

    resetPasswordExpireTimeMs = this.options.resetPasswordExpireTimeMs || 24 * 60 * 60 * 1000;
    storageConnection = this.options.storageConnection_appSettingName || 'AZURE_STORAGE_CONNECTION_STRING';


    constructor(private options?: {
        getVerifyUrl: (verificationToken: string) => string,
        getCancelVerifyUrl: (verificationToken: string) => string,
        storageConnection_appSettingName?: string,
        resetPasswordExpireTimeMs: number,
    }) { }

    getBinding_http = (trigger: { sessionToken: string }): HttpBinding => {
        return {
            route: `api/account/create-session/${trigger.sessionToken}`,
        };
    }

    getBinding_SessionTable = (trigger: { sessionToken: string }): TableBinding => {
        return {
            tableName: 'account',
            partitionKey: `${trigger.sessionToken}`,
            rowKey: `session-user`,
            connection: this.storageConnection
        };
    }

    getBinding_AccountTable = (): TableBinding => {
        return {
            tableName: 'account',
            connection: this.storageConnection,
            partitionKey: undefined,
            rowKey: undefined,
        };
    }

    getResetPasswordUrl = this.options.getVerifyUrl;
    getCancelResetPasswordUrl = this.options.getCancelVerifyUrl;

    // getBinding_UserTable = (trigger: { userId: string }): TableBinding => {
    //     return {
    //         tableName: 'account',
    //         partitionKey: `${trigger.userId}`,
    //         rowKey: `user-session`,
    //         connection: this.storageConnection
    //     };
    // }
}