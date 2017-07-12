
export interface UserInfo {
    sessionId: string;
    userId: string;
}

export interface AppContextInfo {
    path: string;
}

export interface DeviceInfo {
    platform: 'web' | 'ios' | 'android' | 'other';
    appVersion: string;
    userAgent: string;
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