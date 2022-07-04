/**
 * Store the current screen size in state.
 *
 * Of course, this does not *control* the screen size; it only updates the
 * internal state so that we know what it is without polling.
 */
export const setScreenSize = (width: number, height: number) =>
  ({
    type: 'SCREEN_RESIZE',
    width,
    height,
  } as const);

/**
 * Action to adjust screen size.
 */
export type ScreenResize = ReturnType<typeof setScreenSize>;

/**
 * Open a dialog using the given key.
 */
export const openMetaDialog = (key: string) =>
  ({
    type: 'OPEN_META_DIALOG',
    key,
  } as const);

/**
 * Action to open a certain dialog box.
 */
export type OpenMetaDialog = ReturnType<typeof openMetaDialog>;

/**
 * Close the dialog box.
 */
export const closeMetaDialog = () =>
  ({
    type: 'CLOSE_META_DIALOG',
  } as const);

/**
 * Action to close a dialog box.
 */
export type CloseMetaDialog = ReturnType<typeof closeMetaDialog>;
