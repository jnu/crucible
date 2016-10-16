import { TYPE_UINT } from '../types';
import { HDR_VERSION_WIDTH } from '../constants';


export const headerSchema = [
    {
        name: 'version',
        width: HDR_VERSION_WIDTH,
        type: TYPE_UINT
    },
    {
        name: 'gridWidth',
        width: 7,
        type: TYPE_UINT
    },
    {
        name: 'gridHeight',
        width: 7,
        type: TYPE_UINT
    },
    {
        name: 'cellEncodingWidth',
        width: 3,
        type: TYPE_UINT
    },
    {
        name: 'cluesLength',
        width: 25,
        type: TYPE_UINT
    },
    {
        name: 'annotationsLength',
        width: 24,
        type: TYPE_UINT
    },
    {
        name: 'titleLength',
        width: 14,
        type: TYPE_UINT
    },
    {
        name: 'descriptionLength',
        width: 14,
        type: TYPE_UINT
    },
    {
        name: 'copyrightLength',
        width: 14,
        type: TYPE_UINT
    },
    {
        name: 'authorLength',
        width: 14,
        type: TYPE_UINT
    }
];
