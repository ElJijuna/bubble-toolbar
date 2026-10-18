import React, { forwardRef } from 'react';
import type { BubbleGroupProps, BubbleShape } from './types';
import { useBubbleToolbar } from './context';
import { getValidChildren } from './utils/children';
import { resolveSize, formatPx, getGlassStyles } from './utils/styles';

export const BubbleGroup = forwardRef<HTMLDivElement, BubbleGroupProps>(
  (
    {
      children,
      shape: explicitShape,
      size: explicitSize,
      itemGap: explicitItemGap,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const context = useBubbleToolbar();

    const validChildren = getValidChildren(children);
    const count = validChildren.length;

    // Morphological logic:
    // 1 node => circle
    // > 1 node => pill / rounded rectangle
    const computedShape: BubbleShape =
      explicitShape || (count <= 1 ? 'circle' : 'pill');

    const effectiveSize = resolveSize(explicitSize || context.size);
    const effectiveItemGap =
      explicitItemGap !== undefined ? explicitItemGap : context.itemGap;

    const glassStyles = getGlassStyles(
      context.theme,
      context.blurred,
      context.blurAmount,
      context.bordered,
      context.shadow
    );

    const isCircle = computedShape === 'circle';

    const groupStyles: React.CSSProperties = {
      ...glassStyles,
      height: `${effectiveSize}px`,
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      userSelect: 'none',
      ...(isCircle
        ? {
            width: `${effectiveSize}px`,
            minWidth: `${effectiveSize}px`,
            borderRadius: '9999px',
            justifyContent: 'center',
            padding: 0,
          }
        : {
            width: 'auto',
            minWidth: `${effectiveSize}px`,
            borderRadius: '9999px',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingLeft: `${Math.max(12, Math.round(effectiveSize * 0.28))}px`,
            paddingRight: `${Math.max(12, Math.round(effectiveSize * 0.28))}px`,
            gap: formatPx(effectiveItemGap),
          }),
      ...style,
    };

    const combinedClassName = [
      'bubble-group',
      `bubble-group--${computedShape}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        role="group"
        className={combinedClassName}
        style={groupStyles}
        data-shape={computedShape}
        data-items-count={count}
        {...rest}
      >
        {validChildren}
      </div>
    );
  }
);

BubbleGroup.displayName = 'BubbleGroup';

