export class Future<T> {

    public promise: Promise<T>;

    private _cancel?: () => void;

    private _done: boolean = false;

    private _error?: Error = null;

    private _value?: T;

    constructor(promise: Promise<T>, cancel?: () => void) {
        this._cancel = cancel;
        this.promise = promise;
        promise
            .then(v => {
                this._value = v;
            })
            .catch(e => {
                this._error = e;
            });
    }

    get done() {
        return this._done;
    }

    get error() {
        return this._error;
    }

    get value() {
        return this._value;
    }

    public cancel() {
        if (!this._cancel) {
            throw new Error("Routine cannot be canceled.");
        }
        this._cancel();
    }

}