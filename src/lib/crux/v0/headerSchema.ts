import {TYPE_UINT} from '../types';
import {HDR_VERSION_WIDTH} from '../constants';

export type CruxHeaderV0 = {
  version: number;
  gridWidth: number;
  gridHeight: number;
  cellEncodingWidth: number;
  cluesLength: number;
  annotationsLength: number;
  titleLength: number;
  descriptionLength: number;
  authorLength: number;
  copyrightLength: number;
};

export const headerSchema = [
  {
    name: 'version',
    width: HDR_VERSION_WIDTH,
    type: TYPE_UINT,
  },
  {
    name: 'gridWidth',
    width: 7,
    type: TYPE_UINT,
  },
  {
    name: 'gridHeight',
    width: 7,
    type: TYPE_UINT,
  },
  {
    name: 'cellEncodingWidth',
    width: 3,
    type: TYPE_UINT,
  },
  {
    name: 'cluesLength',
    width: 25,
    type: TYPE_UINT,
  },
  {
    name: 'annotationsLength',
    width: 24,
    type: TYPE_UINT,
  },
  {
    name: 'titleLength',
    width: 14,
    type: TYPE_UINT,
  },
  {
    name: 'descriptionLength',
    width: 14,
    type: TYPE_UINT,
  },
  {
    name: 'copyrightLength',
    width: 14,
    type: TYPE_UINT,
  },
  {
    name: 'authorLength',
    width: 14,
    type: TYPE_UINT,
  },
];
