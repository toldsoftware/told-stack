import { Logger } from '@told/stack/src/core/logger/client/logger';
import { clientConfig_logger as clientConfig } from '../../config';

export const logger = new Logger(clientConfig,
    () => ({ sessionId: 's1234', userId: 'u1234' }),
    () => ({ path: 'a/b/c' }),
    () => ({ appVersion: 'v1.0', platform: 'web', userAgent: 'testUserAgent' }),
);