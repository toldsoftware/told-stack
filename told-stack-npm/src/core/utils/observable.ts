import * as O from 'zen-observable';
// import O = require('zen-observable');
export type Observable<T> = O<T>;
export const Observable = (O as any).default as typeof O;
export type Observer<T> = ZenObservable.SubscriptionObserver<T>;
