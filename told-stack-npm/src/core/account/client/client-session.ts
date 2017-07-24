import { randHex } from "../../utils/rand";
import { SessionInfo_Client } from "../config/types";

export class ClientSession implements SessionInfo_Client {
    public sessionToken = createSessonToken();
    public isAnonymous = true;

    constructor(public userId_claimed: string = null) {
        if (!this.userId_claimed) {
            this.userId_claimed = createUserId_anonymous();
        }
    }

    setUserId(userId: string) {
        if (this.isAnonymous) { throw 'setUserId is only valid if the current userId is anonymous'; }
        this.userId_claimed = userId;
        this.isAnonymous = false;
    }
}

function createSessonToken() {
    const iso = (new Date()).toISOString();
    const rand = randHex(16);
    return `s_${iso}_${rand}`;
}

function createUserId_anonymous() {
    const iso = (new Date()).toISOString();
    const rand = randHex(16);
    return `u_anon_${iso}_${rand}`;
}