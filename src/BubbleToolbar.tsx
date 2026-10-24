import type { CSSProperties, ForwardRefExoticComponent, RefAttributes } from 'react';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { BubbleGroup } from './BubbleGroup';
import type { BubbleToolbarContextValue } from './context';
import { BubbleToolbarContext } from './context';
import { LiveSlot } from './live/BubbleLiveActivity';
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
      blurAmount,
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
      liveActivity,
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
        liveActivity,
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
        liveActivity,
        busy,
        activityColors,
        activityDuration,
      ],
    );

    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        toolbarRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // Keep bubbles at their original viewport offset as the shadow gutter grows from 4px to 32px.
    const getPositionStyles = (): CSSProperties => {
      switch (position) {
        case 'bottom':
          return {
            position: 'fixed',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          };
        case 'top':
          return {
            position: 'fixed',
            top: '-4px',
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
      // Scroll containers clip shadows; leave room for their falloff and the hover lift.
      padding: '32px',
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

    const content = (
      <>
        {groups && groups.length > 0
          ? groups.map((groupItems, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: The groups array API identifies groups by position; use compound children for keyed groups.
              <BubbleGroup key={index}>{groupItems}</BubbleGroup>
            ))
          : null}
        {children}
      </>
    );

    return (
      <BubbleToolbarContext.Provider value={contextValue}>
        <div
          ref={setRef}
          role="toolbar"
          aria-label={ariaLabel}
          className={combinedClassName}
          style={containerStyles}
          {...rest}
        >
          {liveActivity ? (
            <LiveSlot controller={liveActivity} toolbarRef={toolbarRef}>
              {content}
            </LiveSlot>
          ) : (
            content
          )}
        </div>
      </BubbleToolbarContext.Provider>
    );
  },
) as BubbleToolbarComponent;

BubbleToolbar.displayName = 'BubbleToolbar';
BubbleToolbar.Group = BubbleGroup;
BubbleToolbar.Search = BubbleSearch;
BubbleToolbar.BreadcrumbSearch = BubbleBreadcrumbSearch;
