import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export { Observable };
export type Observer<T> = Subscriber<T>;
