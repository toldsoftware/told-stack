
export interface UserInfo {
    sessionId: string;
    userId: string;
}

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

    userInfo: UserInfo;
    appContextInfo: AppContextInfo;
    deviceInfo?: DeviceInfo;

}