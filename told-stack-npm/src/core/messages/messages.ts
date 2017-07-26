export interface MessageData {
    kind: MessageKind;
    args: { [name: string]: string };
}

export enum MessageKind {
    VerificationEmail = 'VerificationEmail',
}

export function createMessage_verificationEmail(email: string, verificationToken: string): MessageData {
    return {
        kind: MessageKind.VerificationEmail,
        args: {
            email,
            verificationToken
        }
    };
}