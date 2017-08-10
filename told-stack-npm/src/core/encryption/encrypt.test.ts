import { encrypt, decrypt } from "./encrypt";

async function runTest() {
    const data = { message: 'ABC' };
    const encrypted = await encrypt(data, 'PASSWORD1234');

    const decrypted = await decrypt(encrypted, 'PASSWORD1234');
}

runTest();