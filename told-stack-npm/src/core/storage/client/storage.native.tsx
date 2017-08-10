import * as RX from 'reactxp';
import { StorageType } from './storageType';

class StorageClass implements StorageType {

    constructor() {
        console.log('Using StorageClass (native)');
    }

    getItem(key: string): Promise<string> {
        return RX.Storage.getItem(key) as any;
    }
    getItem_noMemCache(key: string): Promise<string> {
        return RX.Storage.getItem(key) as any;
    }
    setItem(key: string, value: string): Promise<void> {
        return RX.Storage.setItem(key, value) as any;
    }
    setItem_noMemCache(key: string, value: string): Promise<void> {
        return RX.Storage.setItem(key, value) as any;
    }
    hasItem = async (key: string): Promise<boolean> => {
        return (await RX.Storage.getItem(key)) != null;
    }
    clear = async (): Promise<void> => {
        return await RX.Storage.clear();
    }

}

export const Storage = new StorageClass() as StorageType;
