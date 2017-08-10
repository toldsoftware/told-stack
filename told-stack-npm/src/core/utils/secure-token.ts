import * as crypto from 'crypto';

export function createSecureToken() {
    // Crypto safe lowercase alphanumeric only
    return crypto.randomBytes(48).toString('base64').toLowerCase().replace(/[^a-z0-9]/g, '');
}