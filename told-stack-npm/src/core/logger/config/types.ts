
export interface UserInfo {
    sessionId: string;
    userId: string;
}

export interface UserInfoProvider {
    getUserInfo(): UserInfo;
}

export interface AppContextInfo {
    path: string;
}

export interface AppContextInfoProvider {
    getContextInfo(): AppContextInfo;
}

export interface DeviceInfo {
    platform: 'web' | 'ios' | 'android' | 'other';
    appVersion: string;
    userAgent: string;
}

export interface DeviceInfoProvider {
    getDeviceInfo(): DeviceInfo;
}

export interface LogItem {
    category: string;
    event: string;
    data: any;

    isError: boolean;
    time: number;
    runTime: number;

    userInfo: UserInfo;
    appContextInfo: AppContextInfo;
    deviceInfo?: DeviceInfo;
}