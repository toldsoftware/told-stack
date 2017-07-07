import { createBlobService, BlobService } from "azure-storage";
import { asyncIt } from "./async-it";

export async function readBlobAsText(containerName: string, blobName: string) {
    const blobService = createBlobService();
    try {
        return await asyncIt<string>(cb => blobService.getBlobToText(containerName, blobName, cb));
    } catch (err) {

        // Make sure error was caused because blob does not exist
        const bRes = await asyncIt<BlobService.BlobResult>(cb => blobService.doesBlobExist(containerName, blobName, cb));
        if (bRes.exists) {
            throw err;
        }

        return null;
    }
}

export async function readBlob<T>(containerName: string, blobName: string): Promise<T> {
    const text = await readBlobAsText(containerName, blobName);
    if (!text) { return null; }
    return JSON.parse(text) as T;
}