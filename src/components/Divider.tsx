import React from 'react';

export type DividerProps = Readonly<{
  span: number;
  align: 'vertical' | 'horizontal';
  thickness: number;
  color: string;
  offset: number;
  style?: React.CSSProperties;
}>;

export const Divider = ({ span, align, thickness, color, style, offset }: DividerProps) => {
    const spanOffsetKey = align === 'vertical' ? 'top' : 'left';
    const generalOffsetKey = align === 'vertical' ? 'left' : 'top';
    const spanKey = align === 'vertical' ? 'height' : 'width';
    const thicknessKey = align === 'vertical' ? 'width' : 'height';
    const dividerStyle = {
        position: 'absolute',
        backgroundColor: color || '#000',
        [generalOffsetKey]: offset || 0,
        [spanOffsetKey]: `${(1 - span) * 50}%`,
        [spanKey]: `${span * 100}%`,
        [thicknessKey]: thickness || 1
    } as const;

    if (style) {
        Object.assign(dividerStyle, style);
    }

    return (
        <div style={dividerStyle} />
    );
};
