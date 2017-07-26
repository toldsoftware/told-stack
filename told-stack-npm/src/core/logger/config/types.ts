import { SessionInfo_Client } from "../../account/config/types";
export { SessionInfo_Client };

export interface AppContextInfo {
    version: string;
    path: string;
}

export interface DeviceInfo {
    deviceInfo: any;
}

export interface LogItem {
    _attempts?: number;

    category: string;
    event: string;
    data: any;

    isError: boolean;
    time: number;
    runTime: number;
    startTime: number;

    sessionInfo: SessionInfo_Client;
    appContextInfo: AppContextInfo;
    deviceInfo?: DeviceInfo;

}

export interface LogRequestBody {
    items: LogItem[];
    pow: string;
}

export type LogResponseBody = {
    ok?: boolean;
    error?: string;
}
