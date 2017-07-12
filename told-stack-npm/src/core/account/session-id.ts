import { randHex } from "../utils/rand";

export class SessionId {
    public sessionId = createSessonId();

    constructor(public userId: string = null) {
        if (!this.userId) {
            this.userId = createUserId_anonymous();
        }
    }

    setActualUserId(userId: string) {
        if (this.userId.indexOf('anon-') !== 0) { throw 'setActualUserId is only valid if the current userId is anonymous'; }
        this.userId = userId;
    }
}

export function createSessonId() {
    const iso = (new Date()).toISOString();
    const rand = randHex(16);
    return `${iso}_${rand}`;
}

export function createUserId_anonymous() {
    const iso = (new Date()).toISOString();
    const rand = randHex(16);
    return `anon_${iso}_${rand}`;
}