import React, { forwardRef, useMemo } from 'react';
import type { BubbleToolbarProps } from './types';
import { BubbleToolbarContext, BubbleToolbarContextValue } from './context';
import { BubbleGroup } from './BubbleGroup';
import { formatPx } from './utils/styles';

export interface BubbleToolbarComponent
  extends React.ForwardRefExoticComponent<
    BubbleToolbarProps & React.RefAttributes<HTMLDivElement>
  > {
  Group: typeof BubbleGroup;
}

export const BubbleToolbar = forwardRef<HTMLDivElement, BubbleToolbarProps>(
  (
    {
      groups,
      children,
      position = 'bottom',
      theme = 'glass',
      size = 'md',
      blurred = true,
      blurAmount = 16,
      groupGap = 8,
      itemGap = 8,
      bordered = true,
      shadow = true,
      className = '',
      style,
      ariaLabel = 'Toolbar',
      ...rest
    },
    ref
  ) => {
    const contextValue = useMemo<BubbleToolbarContextValue>(
      () => ({
        size,
        theme,
        blurred,
        blurAmount,
        itemGap,
        bordered,
        shadow,
      }),
      [size, theme, blurred, blurAmount, itemGap, bordered, shadow]
    );

    // Compute positioning styles
    const getPositionStyles = (): React.CSSProperties => {
      switch (position) {
        case 'bottom':
          return {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          };
        case 'top':
          return {
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          };
        case 'static':
          return {
            position: 'relative',
          };
        case 'custom':
        default:
          return {};
      }
    };

    const containerStyles: React.CSSProperties = {
      ...getPositionStyles(),
      display: 'inline-flex',
      alignItems: 'center',
      gap: formatPx(groupGap),
      maxWidth: 'calc(100vw - 32px)',
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '4px',
      boxSizing: 'border-box',
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE/Edge
      WebkitOverflowScrolling: 'touch',
      pointerEvents: 'auto',
      ...style,
    };

    const combinedClassName = [
      'bubble-toolbar',
      `bubble-toolbar--${position}`,
      `bubble-toolbar--${theme}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BubbleToolbarContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="toolbar"
          aria-label={ariaLabel}
          className={combinedClassName}
          style={containerStyles}
          {...rest}
        >
          {groups && groups.length > 0
            ? groups.map((groupItems, index) => (
                <BubbleGroup key={index}>
                  {groupItems}
                </BubbleGroup>
              ))
            : null}
          {children}
        </div>
      </BubbleToolbarContext.Provider>
    );
  }
) as BubbleToolbarComponent;

BubbleToolbar.displayName = 'BubbleToolbar';
BubbleToolbar.Group = BubbleGroup;

