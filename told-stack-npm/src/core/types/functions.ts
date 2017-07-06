export interface HttpFunctionRequest {
    query: any;
    body: any;
}

export interface HttpFunctionResponse {
    status?: number;
    body?: any;
    headers?: { [name: string]: string }
}