/**
 * Promise that can be resolved / rejected with an explicit call.
 */
export class Deferred<T> {
    public promise: Promise<T>;
    private _resolve: (value: T) => void;
    private _reject: (error: Error) => void;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public resolve(value: T) {
        this._resolve(value);
    }

    public reject(error: Error) {
        this._reject(error);
    }
}