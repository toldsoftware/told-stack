export interface MessageData {
    kind: MessageKind;
    args: { [name: string]: string | number };
}

export enum MessageKind {
    ResetPasswordEmail = 'ResetPasswordEmail',
}

export function createMessage_resetPasswordEmail(email: string, resetPasswordUrl: string, cancelUrl: string, expireTime: number): MessageData {
    return {
        kind: MessageKind.ResetPasswordEmail,
        args: {
            email,
            resetPasswordUrl,
            cancelUrl,
            expireTime,
        }
    };
}