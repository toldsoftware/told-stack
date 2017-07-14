export interface HttpFunctionRequest<B=any, Q=any> {
    body: B;
    query: Q;
    headers?: { [name: string]: string }
}

export interface HttpFunctionResponseTyped<T> {
    status?: number;
    body?: T;
    headers?: { [name: string]: string }
    isRaw?: boolean;
}

export interface HttpFunctionResponse extends HttpFunctionResponseTyped<any> {
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
