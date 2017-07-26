import { stringifyPow, parsePow } from "../utils/proof-of-work";
import { HttpProvider } from "./http-provider";

export async function fetchPow<TResponse, TBody = {}>(url: string, options?: { body: TBody; method: 'GET' | 'POST'; }): Promise<TResponse> {
    const body = options && options.body && stringifyPow(options.body) || undefined;
    const res = await fetch(url, { method: options && options.method || 'POST', body });
    const resObj = await res.json() as TResponse;
    return resObj;
}

export const httpProvider_proofOfWork: HttpProvider = {
    request: fetchPow,
    parseRequest: parsePow,
};