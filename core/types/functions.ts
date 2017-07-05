interface HttpFunctionRequest {
    query: any;
    body: any;
}

interface HttpFunctionResponse {
    status?: number;
    body: any;
    headers?: { [name: string]: string }
}