import fetch from 'node-fetch';

export async function fetchTyped<TResponse, TBody = {}>(url: string, options?: { body: TBody; }): Promise<TResponse> {
    const body = options && options.body && JSON.stringify(options.body) || undefined;
    const res = await fetch(url, { method: 'POST', body });
    const resObj = await res.json() as TResponse;
    return resObj;
}
