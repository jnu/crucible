import React from 'react';
import {Divider} from './Divider';
import * as muiColors from '@mui/material/colors';

const THICKNESS = 1;
const COLOR = muiColors.grey[300];
const V_SPAN = 0.95;
const H_SPAN = 1.0;

export type GridDividerProps = Readonly<{
  offset: number;
}>;

export const GridVerticalDivider = ({offset}: GridDividerProps) => (
  <Divider
    align="vertical"
    span={V_SPAN}
    color={COLOR}
    thickness={THICKNESS}
    offset={offset}
  />
);

export const GridHorizontalDivider = ({offset}: GridDividerProps) => (
  <Divider
    align="horizontal"
    span={H_SPAN}
    color={COLOR}
    thickness={THICKNESS}
    offset={offset}
  />
);
