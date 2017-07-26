import { MessageData } from "../messages/messages";

export interface EmailProviderConfig {

}

export class EmailProvider {
    constructor(config: EmailProviderConfig) { }

    async sendEmail(toAddress: string, message: MessageData): Promise<{ isSending: boolean, error?: string }> {
        return await {
            isSending: true
        };
    }
}