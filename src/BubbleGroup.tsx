import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { BubbleActivityContext, useGroupActivity } from './activity';
import { useBubbleToolbar } from './context';
import type { BubbleGroupProps, BubbleShape } from './types';
import { getValidChildren } from './utils/children';
import { formatPx, getGlassStyles, resolveSize } from './utils/styles';

export const BubbleGroup = forwardRef<HTMLDivElement, BubbleGroupProps>(
  (
    {
      children,
      shape: explicitShape,
      size: explicitSize,
      itemGap: explicitItemGap,
      busy = false,
      activityColors,
      activityDuration,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const context = useBubbleToolbar();
    const activity = useGroupActivity(Boolean(context.busy || busy));
    const colors = activityColors ?? context.activityColors ?? ['#22d3ee', '#8b5cf6', '#ec4899'];
    const duration = activityDuration ?? context.activityDuration ?? 2.4;

    const validChildren = getValidChildren(children);
    const count = validChildren.length;

    // Morphological logic:
    // 1 node => circle
    // > 1 node => pill / rounded rectangle
    const computedShape: BubbleShape = explicitShape || (count <= 1 ? 'circle' : 'pill');

    const effectiveSize = resolveSize(explicitSize || context.size);
    const effectiveItemGap = explicitItemGap !== undefined ? explicitItemGap : context.itemGap;

    const glassStyles = getGlassStyles(
      context.theme,
      context.blurred,
      context.blurAmount,
      context.bordered,
      context.shadow,
    );

    const isCircle = computedShape === 'circle';

    const groupStyles: CSSProperties & Record<`--bubble-activity-${string}`, string> = {
      '--bubble-activity-color-1': colors[0],
      '--bubble-activity-color-2': colors[1],
      '--bubble-activity-color-3': colors[2],
      '--bubble-activity-duration': `${Number.isFinite(duration) && duration > 0 ? duration : 2.4}s`,
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
      activity.isBusy && 'bubble-group--busy',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BubbleActivityContext.Provider value={activity}>
        {/* biome-ignore lint/a11y/useSemanticElements: This toolbar group is not a form fieldset and exposes an HTMLDivElement ref. */}
        <div
          ref={ref}
          role="group"
          className={combinedClassName}
          style={groupStyles}
          data-shape={computedShape}
          data-items-count={count}
          {...rest}
          aria-busy={activity.isBusy}
        >
          {validChildren}
        </div>
      </BubbleActivityContext.Provider>
    );
  },
);

BubbleGroup.displayName = 'BubbleGroup';
