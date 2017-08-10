export { autoDeviceStorage } from './auto-device-storage';
import { Storage } from './storage';

export type DeviceStorage = typeof Storage;
export const DeviceStorage = Storage;