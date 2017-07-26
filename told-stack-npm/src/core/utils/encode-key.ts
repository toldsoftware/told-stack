
// https://docs.microsoft.com/en-us/rest/api/storageservices/Understanding-the-Table-Service-Data-Model?redirectedfrom=MSDN
export function encodeTableKey(unencoded: string) {
    return encodeURIComponent(unencoded);
}

export function decodeTableKey(encoded: string) {
    return decodeURIComponent(encoded);
}