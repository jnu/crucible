/**
 * View the puzzle as a PDF.
 */
export const viewPdf = () => ({
  type: 'VIEW_PDF',
} as const);

/**
 * Type of the view PDF action.
 */
export type ViewPdf = ReturnType<typeof viewPdf>;

/**
 * View the puzzle in the editor.
 */
export const viewEditor = () => ({
  type: 'VIEW_EDITOR',
} as const);

/**
 * Type of the view editor action.
 */
export type ViewEditor = ReturnType<typeof viewEditor>;
