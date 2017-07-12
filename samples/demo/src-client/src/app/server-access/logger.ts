import { Logger } from '@told/stack/src/core/logger/client/logger';
import { SessionId } from '@told/stack/src/core/account/session-id';
import { clientConfig_logger as clientConfig } from '../../config';
import { DeviceInfoAccess, DeviceInfo } from "../utils/deviceInfo";

const session = new SessionId();
const deviceInfoAccess = new DeviceInfoAccess();
let lastDeviceInfo: Partial<DeviceInfo>;

export const logger = new Logger(clientConfig,
    () => ({ sessionId: session.sessionId, userId: session.userId }),
    () => ({ version: 'v1.0', path: 'a/b/c' }),
    () => ({ deviceInfo: lastDeviceInfo }),
);

export async function subscribeLoggerToDeviceInfoChanges() {
    lastDeviceInfo = await deviceInfoAccess.getDeviceInfo();
    deviceInfoAccess.getDeviceInfo_observable().subscribe(x => {
        lastDeviceInfo = x;
        console.log('DeviceInfo Changed', { lastDeviceInfo });
        logger.log('DeviceInfo', 'Changed', lastDeviceInfo);
    });
}

subscribeLoggerToDeviceInfoChanges();