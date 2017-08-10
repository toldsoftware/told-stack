// https://github.com/chris-rock/node-crypto-examples/blob/master/crypto-ctr.js
import * as crypto from 'crypto';
import { Encrypted } from "./types";
import { asyncNode } from "../utils/async-node";

// Because the government prefers AES 256 over AES 128
// Top secret requires AES 256 (although it doesn't neccessarily provide additional security)
// But, we can say we use the same encrpytion level required for top secret material, so that's the reason
// https://blog.agilebits.com/2013/03/09/guess-why-were-moving-to-256-bit-aes-keys/

const ALGORITHM = 'aes-256-ctr';
// KEY Length is 256 bit for aes 256
const KEY_LENGTH = 32; // 256/8;
// AES is always 128 bit block length for all key lengths
const IV_LENGTH = 16;
// Recommended at least 16 bytes (128 bits)
const SALT_LENGTH = 16;

const CRYPTED_ENCODING = 'base64';
const MAIN_ENCRYPTION_PASSWORD = process.env['MAIN_ENCRYPTION_PASSWORD'];

async function calculateKeyIv(dataPassword: string, salt?: string, iterations = 200007) {
    salt = salt || crypto.randomBytes(SALT_LENGTH).toString('base64');
    const passCombo = MAIN_ENCRYPTION_PASSWORD + dataPassword;
    const keyiv = await asyncNode<Buffer>(cb => crypto.pbkdf2(passCombo, salt, iterations, 512, 'sha512', cb));

    const key = keyiv.subarray(0, KEY_LENGTH);
    const iv = keyiv.subarray(KEY_LENGTH, KEY_LENGTH + IV_LENGTH);

    return { key, iv, salt, iterations };
}

export async function encrypt<T>(data: T, dataPassword: string, pbkdf2Iterations = 200007): Promise<Encrypted<T>> {
    const json = JSON.stringify(data);
    const { key, iv, salt, iterations } = await calculateKeyIv(dataPassword, null, pbkdf2Iterations);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const crypted =
        cipher.update(json, 'utf8', CRYPTED_ENCODING)
        + cipher.final(CRYPTED_ENCODING);
    return {
        crypted,
        salt,
        iterations,
    };
}

export async function decrypt<T>(encrypted: Encrypted<T>, dataPassword: string): Promise<T> {
    const { key, iv } = await calculateKeyIv(dataPassword, encrypted.salt, encrypted.iterations);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    const json =
        decipher.update(encrypted.crypted, CRYPTED_ENCODING, 'utf8')
        + decipher.final('utf8');

    return JSON.parse(json);
}

export async function createPassword() {
    return crypto.randomBytes(48).toString('base64');
}