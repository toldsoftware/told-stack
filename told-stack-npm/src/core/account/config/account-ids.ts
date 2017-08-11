import { randHex, randWord } from "../../utils/rand";
import { createSecureToken } from "../../utils/secure-token";

export function createSessonToken_client() {
    const iso = (new Date()).toISOString();
    const t = createSecureToken();
    const w = randWord();
    return `sc_${iso}_${w}_${t}`.replace(/[^a-zA-Z0-9_]/g, '-');
}

export function createUserId_anonymous_client() {
    const iso = (new Date()).toISOString();
    const t = createSecureToken();
    const w = randWord();
    return `uc_anon_${iso}_${w}_${t}`.replace(/[^a-zA-Z0-9_]/g, '-');
}

export function createSessonToken_server() {
    const iso = (new Date()).toISOString();
    const t = createSecureToken();
    const w = randWord();
    return `ss_${iso}_${w}_${t}`.replace(/[^a-zA-Z0-9_]/g, '-');
}

export function createUserId_server() {
    const iso = (new Date()).toISOString();
    const t = createSecureToken();
    const w = randWord();
    return `us_${iso}_${w}_${t}`.replace(/[^a-zA-Z0-9_]/g, '-');
}

export function createEvidenceToken() {
    const now = Date.now();
    const t = createSecureToken();
    const w = randWord();
    return `e_${now}_${w}_${t}`.replace(/[^a-zA-Z0-9_]/g, '-');
}