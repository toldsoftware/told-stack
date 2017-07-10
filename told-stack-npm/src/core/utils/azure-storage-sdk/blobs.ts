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

export async function readBlobBuffer<T>(containerName: string, blobName: string): Promise<T> {
    const text = await readBlobAsText(containerName, blobName);
    if (!text) { return null; }
    return JSON.parse(text) as T;
}

export interface BlobOptions {
    contentSettings: {
        contentType?: string;
        contentEncoding?: string;
        cacheControl?: string;
    };
}

export async function writeBlobAsText(containerName: string, blobName: string, text: string, blobOptions?: BlobOptions) {
    const blobService = createBlobService();
    return await asyncIt<BlobService.BlobResult>(cb => blobService.createBlockBlobFromText(containerName, blobName, text, blobOptions, cb));
}

export async function writeBlob<T>(containerName: string, blobName: string, data: T, blobOptions?: BlobOptions) {
    return await writeBlobAsText(containerName, blobName, JSON.stringify(data), blobOptions);
}


export async function writeBlobBuffer(containerName: string, blobName: string, data: string | Buffer, blobOptions?: BlobOptions) {
    const blobService = createBlobService();
    return await asyncIt<BlobService.BlobResult>(cb => blobService.createBlockBlobFromText(containerName, blobName, data, blobOptions, cb));
}
