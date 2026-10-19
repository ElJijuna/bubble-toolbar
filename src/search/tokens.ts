import type { CSSProperties } from 'react';
import type { BubbleBreadcrumbSearchTokens } from '../types';

type Unit = 'px' | 'ms' | '';

const TOKENS: Record<keyof BubbleBreadcrumbSearchTokens, readonly [string, Unit]> = {
  width: ['--bubble-search-width', 'px'],
  radius: ['--bubble-search-radius', 'px'],
  divider: ['--bubble-search-divider', ''],
  focusRing: ['--bubble-search-focus-ring', ''],
  optionActiveBg: ['--bubble-search-option-active-bg', ''],
  optionRadius: ['--bubble-search-option-radius', 'px'],
  titleSize: ['--bubble-search-title-size', 'px'],
  titleWeight: ['--bubble-search-title-weight', ''],
  metaSize: ['--bubble-search-meta-size', 'px'],
  mutedOpacity: ['--bubble-search-muted-opacity', ''],
  resultsMaxHeight: ['--bubble-search-results-max-height', 'px'],
  panelPadding: ['--bubble-search-panel-padding', 'px'],
  duration: ['--bubble-search-duration', 'ms'],
  easing: ['--bubble-search-easing', ''],
  breadcrumbSize: ['--bubble-breadcrumb-size', 'px'],
  breadcrumbSeparatorColor: ['--bubble-breadcrumb-separator-color', ''],
  breadcrumbCurrentWeight: ['--bubble-breadcrumb-current-weight', ''],
  breadcrumbMutedOpacity: ['--bubble-breadcrumb-muted-opacity', ''],
};

/** Converts known tokens to CSS custom properties; unknown keys are ignored. */
export function tokensToStyle(tokens: BubbleBreadcrumbSearchTokens | undefined): CSSProperties {
  const style: Record<string, string> = {};
  if (!tokens) {
    return style;
  }
  for (const [key, value] of Object.entries(tokens)) {
    if (!Object.hasOwn(TOKENS, key) || value === undefined || value === null) {
      continue;
    }
    const [name, unit] = TOKENS[key as keyof BubbleBreadcrumbSearchTokens];
    style[name] = typeof value === 'number' && unit ? `${value}${unit}` : String(value);
  }
  return style;
}
