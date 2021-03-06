import { ClientConfig } from "../config/client-config";
import { SessionInfo_Client, AppContextInfo, DeviceInfo, LogItem, LogRequestBody, LogResponseBody } from "../config/types";

export class Logger {

    private _hasSentSessionInfo = false;
    private _startTime = Date.now();
    private _lastSendTime = Date.now();

    private _items: LogItem[] = [];

    private _timeoutId: any = 0;

    constructor(
        private config: ClientConfig,
        private getSessionInfo: () => SessionInfo_Client,
        private getContextInfo: () => AppContextInfo,
        private getDeviceInfo: () => DeviceInfo,
    ) {
        setTimeout(() => this.sendSessionInfo(), 250);
    }

    private sendSessionInfo() {
        if (!this._hasSentSessionInfo) {
            this._hasSentSessionInfo = true;

            this._items.push({
                isError: null,
                category: 'Session',
                event: 'Info',
                data: null,

                time: Date.now(),
                runTime: Date.now() - this._startTime,
                startTime: this._startTime,

                sessionInfo: this.getSessionInfo(),
                appContextInfo: this.getContextInfo(),
                deviceInfo: this.getDeviceInfo(),
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
            isError: isError ? true : undefined,
            category,
            event,
            data,

            time: Date.now(),
            runTime: Date.now() - this._startTime,
            startTime: this._startTime,

            sessionInfo: this.getSessionInfo(),
            appContextInfo: this.getContextInfo(),
            deviceInfo: undefined,
        };

        this._items.push(d);
        this.sendBatch(shouldSendImmediately);

    }

    private sendBatch = (shouldSendImmediately = false) => {
        if (!shouldSendImmediately
            && Date.now() - this._lastSendTime < this.config.timeBatchSeconds * 1000
        ) {
            this.scheduleSend();
            return;
        }

        const items = this._items;
        this._items = [];
        this.sendNow(items);
    }

    private async sendNow(items: LogItem[]) {
        this._lastSendTime = Date.now();
        if (!items || !items.length) { return; }

        items.forEach(x => {
            if (!x.data) { return; }

            let d = x.data;
            if (typeof x.data !== 'string') {
                d = JSON.stringify(x.data);
            }

            if (d.length > this.config.maxDataSize) {
                x.data = 'truncated:' + d.substr(0, this.config.maxDataSize - 16) + '...';
            }
        });

        let sentItems = items;
        let data = { items } as LogRequestBody;

        // If body is too large, break it up
        let hasSentAll = true;
        let count = items.length;
        while (JSON.stringify(data).length > this.config.maxSendSize) {
            if (count === 1) {
                // Truncate Message Data
                sentItems.forEach(x => x.data = 'truncated:' + JSON.stringify(x.data).substr(0, this.config.maxDataSize) + '...');
                break;
            }

            hasSentAll = false;
            count = Math.floor(count / 2);
            sentItems = items.slice(0, count);
            data = { items: sentItems } as LogRequestBody;
        }

        if (!hasSentAll) {
            this._items.push(...items.slice(count));
        }

        const r = await this.config.httpProvider.request<LogResponseBody, LogRequestBody>(this.config.getSendLogUrl(), { method: 'POST', body: data });

        // If send failure, add items back to end of queue to try again
        if (!r.ok) {
            sentItems.forEach(x => x._attempts++);
            this._items.push(...sentItems.filter(x => x._attempts < this.config.maxItemSendAttempts));
        }

        // Immediately Send Again to Send the rest of the batch
        if (!hasSentAll) {
            setTimeout(() => this.sendBatch(true));
        }
    }

    private scheduleSend = () => {
        const timeUsed = Date.now() - this._lastSendTime;
        const timeRemaining = this.config.timeBatchSeconds - timeUsed;
        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(this.sendBatch, timeRemaining);
    }
}