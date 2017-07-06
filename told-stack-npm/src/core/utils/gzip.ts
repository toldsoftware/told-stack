import { gzip } from 'zlib';

export async function gzipText(dataJson: string) {
    return new Promise<Buffer>((resolve, reject) => {
        gzip(dataJson as any, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
}