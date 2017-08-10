// TODO: Move this to azure-functions folder

export interface HttpFunctionRequest<B=any, Q=any> {
    body: B;
    query: Q;
    headers?: { [name: string]: string }
}

export interface HttpFunctionResponse<T=any> {
    status?: number;
    body?: T;
    headers?: { [name: string]: string }
    isRaw?: boolean;
}

export interface HttpResponseOptions {
    cacheControl?: string;
    contentType?: string;
    contentEncoding?: string;
}

export interface HttpFunctionRequest_ClientInfo {
    originalUrl: string;
    method: string;
    query: string;
    headers: {
        [name: string]: string;

        host: string;
        origin: string;
        referer: string;
        ['user-agent']: string;
        // Client IP
        ['x-forwarded-for']: string;
    };
}

export interface HttpBinding {
    route: string;
    authLevel?: 'anonymous' | 'function';
}

export interface QueueBinding {
    queueName: string;
    connection: string;
}

export interface TableBinding {
    tableName: string;
    partitionKey: string;
    rowKey: string;
    connection: string;
}

export interface BlobBinding {
    path: string;
    connection: string;
}

export interface SendGridBinding {
    // type: 'sendGrid',
    // direction: 'out',
    apiKey: string,
}

export type Binding = HttpBinding | QueueBinding | TableBinding | BlobBinding | SendGridBinding;
export type BindingType = 'httpTrigger' | 'http' | 'queueTrigger' | 'queue' | 'tableTrigger' | 'table' | 'blobTrigger' | 'blob' | 'sendGrid';
export type BindingFull = (Binding & {
    name: string;
    type: BindingType;
    direction: 'in' | 'out';
}) | {
        name: 'req',
        type: 'httpTrigger',
        direction: 'in',
        authLevel: 'anonymous',
        route: string
    } | {
        name: 'res',
        type: 'http',
        direction: 'out'
    };

export function bindingNameToType(name: string): BindingType {
    // Use name to set type
    if (name.match('Queue$')) {
        return 'queue';
    } else if (name.match('Table$')) {
        return 'table';
    } else if (name.match('Blob$')) {
        return 'blob';

    } else if (name.match('QueueTrigger$')) {
        return 'queueTrigger';
    } else if (name.match('TableTrigger$')) {
        return 'tableTrigger';
    } else if (name.match('BlobTrigger$')) {
        return 'blobTrigger';

    } else if (name.match('SendGrid$')) {
        return 'sendGrid';
    }

    throw 'Unknown BindingName:' + name;
}

// https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html
export interface SendGridMessage {
    from: { email: string, name?: string },
    content: ({
        type: 'text/plain',
        value: string,
    } | {
            type: 'text/html',
            value: string,
        })[],
    personalizations: {
        to: { email: string, name?: string }[],
        subject: string,
    }[];
}

export interface EmailMessage {
    from: { email: string, name?: string },

    to: { email: string, name?: string },
    subject: string,

    content: ({
        type: 'text/plain',
        value: string,
    } | {
            type: 'text/html',
            value: string,
        })[],
}

export type AnyBinding = QueueBinding | TableBinding | BlobBinding;