export interface EmailMessage {
    from: { email: string, name?: string },

    to: { email: string, name?: string },
    subject: string,

    content: {
        plain: string;
        html: string;
    }
}