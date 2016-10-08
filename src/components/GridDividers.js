import React from 'react';
import { Divider } from './Divider';
import * as muiColors from 'material-ui/styles/colors';


const THICKNESS = 1;
const COLOR = muiColors.grey300;
const V_SPAN = 0.95;
const H_SPAN = 1.0;


export const GridVerticalDivider = ({ offset }) =>
    <Divider align="vertical" span={V_SPAN} color={COLOR} thickness={THICKNESS} offset={offset} />;

export const GridHorizontalDivider = ({ offset }) =>
    <Divider align="horizontal" span={H_SPAN} color={COLOR} thickness={THICKNESS} offset={offset} />;
