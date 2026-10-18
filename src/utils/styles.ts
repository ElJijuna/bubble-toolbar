import type { CSSProperties } from 'react';
import type { BubbleToolbarTheme, BubbleToolbarSize } from '../types';

export function resolveSize(size: BubbleToolbarSize): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm':
      return 40;
    case 'lg':
      return 56;
    case 'md':
    default:
      return 48;
  }
}

export function formatPx(val: number | string): string {
  return typeof val === 'number' ? `${val}px` : val;
}

export function getGlassStyles(
  theme: BubbleToolbarTheme,
  blurred: boolean,
  blurAmount: number | string,
  bordered: boolean,
  shadow: boolean | string
): CSSProperties {
  const blurVal = formatPx(blurAmount);

  // Background and border tint based on theme
  let background: string;
  let borderColor: string;
  let color: string;

  switch (theme) {
    case 'dark':
      background = blurred ? 'rgba(24, 24, 27, 0.72)' : 'rgba(24, 24, 27, 0.95)';
      borderColor = 'rgba(255, 255, 255, 0.12)';
      color = '#f4f4f5';
      break;
    case 'light':
      background = blurred ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.95)';
      borderColor = 'rgba(0, 0, 0, 0.08)';
      color = '#18181b';
      break;
    case 'auto':
      background = 'var(--bubble-bg, rgba(255, 255, 255, 0.75))';
      borderColor = 'var(--bubble-border, rgba(0, 0, 0, 0.08))';
      color = 'var(--bubble-fg, #18181b)';
      break;
    case 'glass':
    default:
      // Neutral luminous frosted glass
      background = blurred ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.92)';
      borderColor = 'rgba(255, 255, 255, 0.4)';
      color = '#09090b';
      break;
  }

  const boxShadow =
    typeof shadow === 'string'
      ? shadow
      : shadow
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)'
      : 'none';

  return {
    backgroundColor: background,
    backdropFilter: blurred ? `blur(${blurVal}) saturate(180%)` : undefined,
    WebkitBackdropFilter: blurred ? `blur(${blurVal}) saturate(180%)` : undefined,
    border: bordered ? `1px solid ${borderColor}` : 'none',
    boxShadow,
    color,
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };
}

