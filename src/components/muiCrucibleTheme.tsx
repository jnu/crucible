import * as muiColors from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';


export const muiCrucibleTheme = {
    spacing: {
        iconSize: 24,
        desktopGutter: 24,
        desktopGutterMore: 32,
        desktopGutterLess: 16,
        desktopGutterMini: 8,
        desktopKeylineIncrement: 64,
        desktopDropDownMenuItemHeight: 32,
        desktopDropDownMenuFontSize: 15,
        desktopDrawerMenuItemHeight: 48,
        desktopSubheaderHeight: 48,
        desktopToolbarHeight: 56
    },
    fontFamily: 'Radley, serif',
    palette: {
        primary1Color: muiColors.red500,
        primary2Color: muiColors.red700,
        primary3Color: muiColors.grey400,
        accent1Color: muiColors.pinkA200,
        accent2Color: muiColors.grey100,
        accent3Color: muiColors.grey500,
        textColor: muiColors.grey900,
        secondaryTextColor: fade(muiColors.grey900, 0.54),
        alternateTextColor: muiColors.white,
        canvasColor: muiColors.white,
        borderColor: muiColors.grey300,
        disabledColor: fade(muiColors.darkBlack, 0.3),
        pickerHeaderColor: muiColors.cyan500,
        clockCircleColor: fade(muiColors.darkBlack, 0.07),
        shadowColor: muiColors.fullBlack
  }
} as const;
