import * as crypto from 'crypto';
import { asyncNode } from "./async-node";

export type PasswordHash = string & { __type: 'passwordHash' };

const ITERATIONS = 10000;

export async function hashPassword(password: string, userSalt: string): Promise<PasswordHash> {
    const result = await asyncNode<Buffer>(cb => crypto.pbkdf2(password, userSalt, ITERATIONS, 512, 'sha512', cb));
    return result.toString('base64') as PasswordHash;
}