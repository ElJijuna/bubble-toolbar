import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import type { BubbleAreaProps } from '../types';
import { formatPx } from '../utils/styles';

export const BubbleArea = forwardRef<HTMLDivElement, BubbleAreaProps>(
  ({ children, minWidth = 120, maxWidth, className = '', style, ...rest }, ref) => {
    const areaStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      minWidth: formatPx(minWidth),
      maxWidth: maxWidth ? formatPx(maxWidth) : undefined,
      flex: '1 1 auto',
      fontSize: '14px',
      color: 'inherit',
      ...style,
    };

    return (
      <div ref={ref} className={`bubble-area ${className}`.trim()} style={areaStyles} {...rest}>
        {children}
      </div>
    );
  },
);

BubbleArea.displayName = 'BubbleArea';
