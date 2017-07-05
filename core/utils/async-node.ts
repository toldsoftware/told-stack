export function asyncNode<T>(call: (serviceCallback: (error: any, result: T) => void) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        try {
            call((error, result) => {
                if (error) { reject(error); return; }
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
}


export function asyncNode_noError<T>(call: (serviceCallback: (result: T) => void) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        try {
            call((result) => {
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
}
