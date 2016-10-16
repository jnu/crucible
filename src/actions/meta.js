export const setScreenSize = (width, height) => ({
    type: 'SCREEN_RESIZE',
    width,
    height
});

export const openMetaDialog = key => ({
    type: 'OPEN_META_DIALOG',
    key
});

export const closeMetaDialog = () => ({
    type: 'CLOSE_META_DIALOG'
});


