import * as muiColors from '@mui/material/colors';
import {alpha} from '@mui/system';

export const muiCrucibleTheme = {
  spacing: [0, 4, 8, 16, 32, 64],
  typography: {
    fontFamily: 'Radley, serif',
  },
  palette: {
    primary: {
      main: muiColors.lightBlue.A400,
    },
    secondary: {
      main: muiColors.pink.A200,
      contrastText: muiColors.grey[100],
      light: muiColors.grey[500],
    },
    text: {
      primary: muiColors.grey[900],
      secondary: alpha(muiColors.grey[900], 0.54),
      disabled: alpha(muiColors.common.black, 0.3),
    },
    background: {
      paper: muiColors.common.white,
    },
    divider: muiColors.grey[300],
  },
} as const;
