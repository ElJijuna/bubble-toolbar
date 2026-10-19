import type { CSSProperties, ForwardRefExoticComponent, RefAttributes } from 'react';
import { forwardRef, useMemo } from 'react';
import { BubbleGroup } from './BubbleGroup';
import type { BubbleToolbarContextValue } from './context';
import { BubbleToolbarContext } from './context';
import { BubbleBreadcrumbSearch } from './search/BubbleBreadcrumbSearch';
import { BubbleSearch } from './search/BubbleSearch';
import type { BubbleToolbarProps } from './types';
import { formatPx } from './utils/styles';

export interface BubbleToolbarComponent
  extends ForwardRefExoticComponent<BubbleToolbarProps & RefAttributes<HTMLDivElement>> {
  Group: typeof BubbleGroup;
  Search: typeof BubbleSearch;
  BreadcrumbSearch: typeof BubbleBreadcrumbSearch;
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
      busy = false,
      activityColors,
      activityDuration,
      className = '',
      style,
      ariaLabel = 'Toolbar',
      ...rest
    },
    ref,
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
        position,
        busy,
        activityColors,
        activityDuration,
      }),
      [
        size,
        theme,
        blurred,
        blurAmount,
        itemGap,
        bordered,
        shadow,
        position,
        busy,
        activityColors,
        activityDuration,
      ],
    );

    // Compute positioning styles
    const getPositionStyles = (): CSSProperties => {
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
        default:
          return {};
      }
    };

    const containerStyles: CSSProperties = {
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
                // biome-ignore lint/suspicious/noArrayIndexKey: The groups array API identifies groups by position; use compound children for keyed groups.
                <BubbleGroup key={index}>{groupItems}</BubbleGroup>
              ))
            : null}
          {children}
        </div>
      </BubbleToolbarContext.Provider>
    );
  },
) as BubbleToolbarComponent;

BubbleToolbar.displayName = 'BubbleToolbar';
BubbleToolbar.Group = BubbleGroup;
BubbleToolbar.Search = BubbleSearch;
BubbleToolbar.BreadcrumbSearch = BubbleBreadcrumbSearch;
