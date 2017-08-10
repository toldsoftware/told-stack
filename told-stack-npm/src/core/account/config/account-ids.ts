import { randHex, randWord } from "../../utils/rand";

export function createSessonToken_client() {
    const iso = (new Date()).toISOString();
    const p = performance.now();
    const rand = randHex(16);
    const w = randWord();
    return `sc_${iso}_${w}_${p}_${rand}`;
}

export function createUserId_anonymous_client() {
    const iso = (new Date()).toISOString();
    const p = performance.now();
    const rand = randHex(16);
    const w = randWord();
    return `uc_anon_${iso}_${w}_${p}_${rand}`;
}

export function createSessonToken_server() {
    const iso = (new Date()).toISOString();
    const rand = randHex(32);
    const w = randWord();
    return `ss_${iso}_${w}_${rand}`;
}

export function createUserId_server() {
    const iso = (new Date()).toISOString();
    const rand = randHex(32);
    const w = randWord();
    return `us_${iso}_${w}_${rand}`;
}

export function createEvidenceToken() {
    const now = Date.now();
    const rand = randHex(64);
    const w = randWord();
    return `e_${now}_${w}_${rand}`;
}