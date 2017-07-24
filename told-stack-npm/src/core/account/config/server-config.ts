import { TableBinding } from "../../types/functions";

export interface FunctionTemplateConfig {
    getBinding_lookupUser_fromSession(triggerData: { sessionToken: string }): TableBinding

}

export interface ServerConfigType {

}

export class ServerConfig implements ServerConfigType, FunctionTemplateConfig {

    storageConnection = this.options.storageConnection_appSettingName || 'AZURE_STORAGE_CONNECTION_STRING';

    constructor(private options?: {
        storageConnection_appSettingName?: string
    }) { }

    getBinding_lookupUser_fromSession(triggerData: { sessionToken: string }): TableBinding {
        return {
            tableName: 'session',
            partitionKey: `${triggerData.sessionToken}`,
            rowKey: `user`,
            connection: this.storageConnection
        };
    }
}