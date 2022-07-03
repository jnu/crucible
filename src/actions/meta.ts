/**
 * Store the current screen size in state.
 *
 * Of course, this does not *control* the screen size; it only updates the
 * internal state so that we know what it is without polling.
 */
export const setScreenSize = (width: number, height: number) => ({
    type: 'SCREEN_RESIZE',
    width,
    height
});

/**
 * Open a dialog using the given key.
 */
export const openMetaDialog = (key: string) => ({
    type: 'OPEN_META_DIALOG',
    key
});

/**
 * Close the dialog box.
 */
export const closeMetaDialog = () => ({
    type: 'CLOSE_META_DIALOG'
});


