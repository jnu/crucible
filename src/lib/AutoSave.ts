import * as crux from './crux';


const NOOP = () => {};


export class AutoSave {

    public pollInterval: number = 5000;

    public storageClient:

    private _interval: number = null

    constructor({ getState, pollInterval, storageClient, onSaveStart, onSaveSuccess, onSaveError }) {
        this._lastState = getState();
        this._lastBitmap = crux.write(this._lastState);
        this.onSaveStart = onSaveStart || NOOP;
        this.onSaveSuccess = onSaveSuccess || NOOP;
        this.onSaveError = onSaveError || NOOP;
        this.getState = getState;
        this.storageClient = storageClient;
        this.pollInterval = pollInterval || this.pollInterval;
        this._check = this._check.bind(this);
        this._interval = null;
    }

    start() {
        if (!this._interval) {
            this._interval = setInterval(this._check, this.pollInterval);
        }
    }

    stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

    _check() {
        const { getState, _lastState, _lastBitmap } = this;
        const newState = getState();

        // Don't update when state hasn't changed.
        if (_lastState === newState) {
            return;
        }

        // Test that the bitmap has actually changed as well. For a lot of
        // reasons it might not have even if the state has.
        const bitmap = crux.write(newState);
        if (_lastBitmap === bitmap) {
            return;
        }

        this._doSave(newState, bitmap);
    }

    _doSave(state, bitmap) {
        this.onSaveStart();
        const ts = Date.now();
        const id = state.get('id');

        this.storageClient
            .save('puzzle', id.format(), { ts, bitmap })
            .then(() => {
                this._lastState = state;
                this._lastBitmap = bitmap;
                this.onSaveSuccess(state);
            })
            .catch(this.onSaveError);
    }

}
