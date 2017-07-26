import { randHex } from "../../utils/rand";

export function createSessonToken_client() {
    const iso = (new Date()).toISOString();
    const p = performance.now();
    const rand = randHex(16);
    return `sc_${iso}_${p}_${rand}`;
}

export function createUserId_anonymous_client() {
    const iso = (new Date()).toISOString();
    const p = performance.now();
    const rand = randHex(16);
    return `uc_anon_${iso}_${p}_${rand}`;
}

export function createSessonToken_server() {
    const iso = (new Date()).toISOString();
    const rand = randHex(32);
    return `ss_${iso}_${rand}`;
}

export function createUserId_server() {
    const iso = (new Date()).toISOString();
    const rand = randHex(32);
    return `us_${iso}_${rand}`;
}

export function createVerificationToken() {
    const now = Date.now();
    const rand = randHex(64);
    return `v_${now}_${rand}`;
}