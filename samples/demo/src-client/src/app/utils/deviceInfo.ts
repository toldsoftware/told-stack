import * as RX from 'reactxp';
import { Observable, Observer } from "@told/stack/src/core/utils/observable";
import { assignPartial } from "@told/stack/src/core/utils/objects";

export interface DeviceInfo {
    platform: string;

    isHighPixelDensityScreen: boolean;
    windowSize: RX.Types.LayoutInfo;
    pixelRatio: number;
    maxContentSizeMultiplier: number;

    isScreenReaderEnabled: boolean;

    initialUrl: string;

    timeZoneOffset: number;
    isLocationAvailable: boolean;

    web_userAgent: string;
    web_platform: string;
    web_language: string;
    web_locationHref: string;

    // Events
    lastActivationState: string;
    lastDeepLinkRequest: string;
    lastConnectivity: boolean;
    lastContentSizeMultiplier: number;
    lastIsNavigatingWithKeyboard: boolean;
    lastUserPresence: boolean;
}

export class DeviceInfoAccess {

    private deviceInfo: DeviceInfo;

    private _isSubscribed: boolean;
    private _observable: Observable<Partial<DeviceInfo>>;
    private _observer: Observer<Partial<DeviceInfo>>;

    getDeviceInfo = async (forceRefresh = false): Promise<DeviceInfo> => {
        await this.init(forceRefresh);
        return this.deviceInfo;
    }

    getDeviceInfo_observable(): Observable<Partial<DeviceInfo>> {
        if (!this._observable) {
            this._observable = new Observable(observer => {
                this._observer = observer;
            });
            this.subscribe();
        }
        return this._observable;
    }

    private trigger(change: Partial<DeviceInfo>) {
        console.log('DeviceInfoAccess.trigger', { change });

        assignPartial(this.deviceInfo, change);

        if (this._observer) {
            this._observer.next(change);
        }
    }

    private init = async (forceRefresh = false) => {
        if (!forceRefresh && this.deviceInfo) { return; }

        this.deviceInfo = {} as any;
        this.deviceInfo.platform = RX.Platform.getType();

        this.deviceInfo.isHighPixelDensityScreen = RX.UserInterface.isHighPixelDensityScreen();
        this.deviceInfo.windowSize = RX.UserInterface.measureWindow();
        this.deviceInfo.pixelRatio = RX.UserInterface.getPixelRatio();
        this.deviceInfo.lastContentSizeMultiplier = await RX.UserInterface.getContentSizeMultiplier();
        this.deviceInfo.maxContentSizeMultiplier = await RX.UserInterface.getMaxContentSizeMultiplier();

        this.deviceInfo.isScreenReaderEnabled = RX.Accessibility.isScreenReaderEnabled();

        this.deviceInfo.initialUrl = await RX.Linking.getInitialUrl();

        this.deviceInfo.timeZoneOffset = new Date().getTimezoneOffset();
        this.deviceInfo.isLocationAvailable = RX.Location.isAvailable();

        if (this.deviceInfo.platform === 'web') {
            this.deviceInfo.web_userAgent = window.navigator.userAgent;
            this.deviceInfo.web_platform = window.navigator.platform;
            this.deviceInfo.web_language = window.navigator.language;
            this.deviceInfo.web_locationHref = window.location.href;
        }

        this.deviceInfo.lastActivationState = RX.Types.AppActivationState[RX.App.getActivationState()];
    }

    private subscribe() {
        if (!this._isSubscribed) { return; }
        this._isSubscribed = true;

        RX.App.activationStateChangedEvent.subscribe((state) => {
            this.trigger({
                lastActivationState: RX.Types.AppActivationState[state]
            });
        });

        RX.Linking.deepLinkRequestEvent.subscribe((e) => {
            this.trigger({
                lastDeepLinkRequest: e
            });
        });

        RX.Network.connectivityChangedEvent.subscribe((e) => {
            this.trigger({
                lastConnectivity: e
            });
        });

        RX.UserInterface.contentSizeMultiplierChangedEvent.subscribe((e) => {
            this.trigger({
                lastContentSizeMultiplier: e
            });
        });

        RX.UserInterface.keyboardNavigationEvent.subscribe((e) => {
            this.trigger({
                lastIsNavigatingWithKeyboard: e
            });
        });

        RX.UserPresence.userPresenceChangedEvent.subscribe((e) => {
            this.trigger({
                lastUserPresence: e
            });
        });
    }

}
