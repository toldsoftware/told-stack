export interface HttpProvider_Client {
    request<TResponse, TBody>(url: string, options?: { body: TBody; method: 'GET' | 'POST'; }): Promise<TResponse>;
}

export interface HttpProvider_Server {
    parseRequest<TBody>(body: string): {
        data: TBody,
        data_ignoreVerificationError?: TBody,
        error?: string,
    };
}

export interface HttpProvider extends HttpProvider_Client, HttpProvider_Server {
}
