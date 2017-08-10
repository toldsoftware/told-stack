import { createTableBinding, createQueueBinding, createSendGridBinding } from "../../azure-functions/function-base";
import { EmailMessage } from "./types";

export interface EmailQueue {
    message: EmailMessage;
}

export interface EmailTable {
    to: string;
    from: string;
    subject: string;
    plainContent: string;
    message: EmailMessage;
}

export class ServerConfig {
    constructor(private options: {
        storageConnection_appSettingName?: string,
        sendGridApiKey_appSettingName?: string,
    }) { }

    storageConnection = this.options.storageConnection_appSettingName || 'AZURE_STORAGE_CONNECTION_STRING';
    sendGridApiKey = this.options.sendGridApiKey_appSettingName || 'AzureWebJobsSendGridApiKey';

    binding_emailQueue_trigger = createQueueBinding<EmailQueue>(() => ({
        connection: this.storageConnection,
        queueName: 'email',
    }));

    binding_emailQueue_out = createQueueBinding<EmailQueue[]>(() => ({
        connection: this.storageConnection,
        queueName: 'email',
    }));

    binding_emailTable_out = createTableBinding<EmailTable & { PartitionKey: string, RowKey: string }>(() => ({
        connection: this.storageConnection,
        tableName: 'email',
        partitionKey: undefined,
        rowKey: undefined,
    }));

    binding_sendGrid = createSendGridBinding(() => ({
        apiKey: this.sendGridApiKey,
    }));

}