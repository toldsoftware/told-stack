export interface Encrypted<T> {
    crypted: string;
    salt: string;
    iterations: number;
    // lookup?: string;
}