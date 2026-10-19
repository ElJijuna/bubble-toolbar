import type { BubbleBreadcrumbSearchTokens } from '../types';
import type { TokenMap } from '../utils/tokens';
import { createTokenStyle } from '../utils/tokens';

const TOKENS: TokenMap<keyof BubbleBreadcrumbSearchTokens> = {
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

/** Converts known search tokens to CSS custom properties; unknown keys are ignored. */
export const tokensToStyle = createTokenStyle(TOKENS);
