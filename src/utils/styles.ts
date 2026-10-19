import type { CSSProperties } from 'react';
import type { BubbleToolbarSize, BubbleToolbarTheme } from '../types';

export function resolveSize(size: BubbleToolbarSize): number {
  if (typeof size === 'number') {
    return size;
  }
  switch (size) {
    case 'sm':
      return 40;
    case 'lg':
      return 56;
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
  shadow: boolean | string,
): CSSProperties {
  const blurVal = formatPx(blurAmount);

  // Every color reads a token first; fallbacks are the original values.
  let background: string;
  let borderColor: string;
  let color: string;

  switch (theme) {
    case 'dark':
      background = blurred
        ? 'var(--bubble-dark-bg, rgba(24, 24, 27, 0.72))'
        : 'var(--bubble-dark-bg-solid, rgba(24, 24, 27, 0.95))';
      borderColor = 'var(--bubble-dark-border, rgba(255, 255, 255, 0.12))';
      color = 'var(--bubble-dark-fg, #f4f4f5)';
      break;
    case 'light':
      background = blurred
        ? 'var(--bubble-light-bg, rgba(255, 255, 255, 0.75))'
        : 'var(--bubble-light-bg-solid, rgba(255, 255, 255, 0.95))';
      borderColor = 'var(--bubble-light-border, rgba(0, 0, 0, 0.08))';
      color = 'var(--bubble-light-fg, #18181b)';
      break;
    case 'auto':
      background = 'var(--bubble-bg, var(--bubble-light-bg, rgba(255, 255, 255, 0.75)))';
      borderColor = 'var(--bubble-border, var(--bubble-light-border, rgba(0, 0, 0, 0.08)))';
      color = 'var(--bubble-fg, var(--bubble-light-fg, #18181b))';
      break;
    default:
      // Neutral luminous frosted glass
      background = blurred
        ? 'var(--bubble-glass-bg, rgba(255, 255, 255, 0.65))'
        : 'var(--bubble-glass-bg-solid, rgba(255, 255, 255, 0.92))';
      borderColor = 'var(--bubble-glass-border, rgba(255, 255, 255, 0.4))';
      color = 'var(--bubble-glass-fg, #09090b)';
      break;
  }

  const boxShadow =
    typeof shadow === 'string'
      ? shadow
      : shadow
        ? 'var(--bubble-glass-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06))'
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
