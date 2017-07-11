import { ClientConfig } from "../config/client-config";
import { UserInfoProvider, AppContextInfoProvider, DeviceInfoProvider, LogItem } from "../config/types";

export class Logger {

    private _hasSentSessionInfo = false;
    private _startTime = Date.now();
    private _lastSendTime = Date.now();

    private _items: LogItem[] = [];

    constructor(
        private config: ClientConfig,
        private userInfo: UserInfoProvider,
        private contextInfo: AppContextInfoProvider,
        private deviceInfo: DeviceInfoProvider,
    ) {
        setTimeout(() => this.sendSessionInfo(), 250);
    }

    private sendSessionInfo() {
        if (!this._hasSentSessionInfo) {
            this._hasSentSessionInfo = true;

            this._items.push({
                category: 'Session',
                event: 'Info',
                data: null,

                userInfo: this.userInfo.getUserInfo(),
                appContextInfo: this.contextInfo.getContextInfo(),
                deviceInfo: this.deviceInfo.getDeviceInfo(),

                isError: undefined,
                time: Date.now(),
                runTime: Date.now() - this._startTime
            });

            this.sendBatch(true);
        }
    }

    error(category: string, event: string, data: Object, shouldSendImmediately = false) {
        this.log(category, event, data, true, true);
    }

    major(category: string, event: string, data: Object, shouldSendImmediately = false) {
        this.log(category, event, data, true);
    }

    log(category: string, event: string, data: Object, shouldSendImmediately = false, isError = false) {

        const d: LogItem = {
            category,
            event,
            data,

            userInfo: this.userInfo.getUserInfo(),
            appContextInfo: this.contextInfo.getContextInfo(),
            deviceInfo: undefined,

            isError,
            time: Date.now(),
            runTime: Date.now() - this._startTime
        };

        this._items.push(d);
        this.sendBatch(shouldSendImmediately);

    }

    private sendBatch(shouldSendImmediately = false) {
        if (!shouldSendImmediately
            && Date.now() - this._lastSendTime < this.config.timeBatchSeconds * 1000) { return; }

        const items = this._items;
        this._items = [];
        this.sendNow(items);
    }

    private async sendNow(items: LogItem[]) {
        const body = JSON.stringify(items);
        const r = await fetch(this.config.getSendLogUrl(), { body });

        // If send failure, add items back?
        if (!r.ok) {
            this._items.push(...items);
        }
    }
}