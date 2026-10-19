import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BubbleToolbarTheme = 'light' | 'dark' | 'auto' | 'glass';
export type BubbleToolbarPosition = 'bottom' | 'top' | 'static' | 'custom';
export type BubbleToolbarSize = 'sm' | 'md' | 'lg' | number;
export type BubbleShape = 'circle' | 'pill';

/** Activity appearance inherited by each bubble group. */
export interface BubbleActivityProps {
  /** Adds external activity; false does not hide pending local tasks. */
  busy?: boolean;
  /** Three CSS colors used by the rotating activity border. */
  activityColors?: readonly [string, string, string];
  /** Seconds per rotation. Defaults to 2.4. */
  activityDuration?: number;
}

export interface BubbleToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    BubbleActivityProps {
  /**
   * Definition of items by groups.
   * Example:
   * [
   *   [<Logo />],
   *   [<IconButton name="search" />, <ToolbarArea />],
   *   [<IconButton name="theme" />],
   *   [<IconButton name="chat" />],
   *   [<IconButton name="notifications" />]
   * ]
   */
  groups?: ReactNode[][];

  /**
   * Alternatively, declarative composition using BubbleToolbar.Group children.
   */
  children?: ReactNode;

  /**
   * Placement on the screen.
   * @default 'bottom'
   */
  position?: BubbleToolbarPosition;

  /**
   * Visual theme styling.
   * @default 'glass'
   */
  theme?: BubbleToolbarTheme;

  /**
   * Toolbar height / bubble diameter.
   * Preset 'sm' (40px), 'md' (48px), 'lg' (56px) or numeric pixels.
   * @default 'md'
   */
  size?: BubbleToolbarSize;

  /**
   * Whether to apply the blurred frosted glass effect (backdrop-filter: blur).
   * @default true
   */
  blurred?: boolean;

  /**
   * Amount of backdrop blur in pixels or CSS string.
   * @default 16
   */
  blurAmount?: number | string;

  /**
   * Spacing between bubble groups.
   * @default 8
   */
  groupGap?: number | string;

  /**
   * Spacing between elements inside a multi-node pill group.
   * @default 8
   */
  itemGap?: number | string;

  /**
   * Whether to display subtle borders around bubbles.
   * @default true
   */
  bordered?: boolean;

  /**
   * Whether to render floating shadow, or custom shadow CSS string.
   * @default true
   */
  shadow?: boolean | string;

  /**
   * Custom CSS class name for toolbar container.
   */
  className?: string;

  /**
   * Inline CSS styles for toolbar container.
   */
  style?: CSSProperties;

  /**
   * Accessible ARIA label for toolbar.
   * @default 'Toolbar'
   */
  ariaLabel?: string;
}

export interface BubbleGroupProps extends HTMLAttributes<HTMLDivElement>, BubbleActivityProps {
  /**
   * Elements inside this group.
   * 1 node renders as a circle.
   * More than 1 node renders as a pill / rounded rectangle.
   */
  children?: ReactNode;

  /**
   * Force shape instead of auto-calculating from children count.
   */
  shape?: BubbleShape;

  /**
   * Override bubble size / height for this specific group.
   */
  size?: BubbleToolbarSize;

  /**
   * Gap between items in this group.
   */
  itemGap?: number | string;

  /**
   * Custom CSS class name.
   */
  className?: string;

  /**
   * Inline CSS styles.
   */
  style?: CSSProperties;
}

export interface BubbleIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon identifier or label for standard icons.
   */
  name?: string;

  /**
   * Custom icon element or SVG.
   */
  icon?: ReactNode;

  /**
   * Active or toggled state.
   * @default false
   */
  active?: boolean;

  /**
   * Optional badge count or indicator.
   */
  badge?: ReactNode | number | string;

  /**
   * Tooltip text.
   */
  tooltip?: string;

  /**
   * Explicit accessible label.
   */
  ariaLabel?: string;
}

export interface BubbleAreaProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content inside the toolbar area (e.g. search input, label, sliders).
   */
  children?: ReactNode;

  /**
   * Minimum width for the area.
   */
  minWidth?: number | string;

  /**
   * Maximum width for the area.
   */
  maxWidth?: number | string;
}

/** A search result or suggestion. Its shape is fixed so the listbox layout stays intact. */
export interface BubbleSearchItem {
  /** Stable identifier, used as React key. */
  id: string;
  /** Main line of the option. */
  title: string;
  /** Optional secondary line, e.g. a path. */
  description?: string;
}

/** Visible and accessible texts of BubbleSearch. */
export interface BubbleSearchLabels {
  /** Accessible name of the search group. @default 'Search' */
  group: string;
  /** Accessible name of the search button. @default 'Search' */
  button: string;
  /** Accessible name of the combobox input. @default 'Search' */
  input: string;
  /** Accessible name of the results listbox. @default 'Results' */
  listbox: string;
  /** @default 'Search…' */
  placeholder: string;
  /** @default 'Searching…' */
  searching: string;
  /** @default 'No results. Try another term or explore a suggestion.' */
  noResults: string;
  /** @default 'Suggestions' */
  suggestions: string;
  /** @default (count) => '1 result' | `${count} results` */
  results: (count: number) => string;
  /** @default '↑ ↓ to explore · Enter to select · Esc to close' */
  hint: string;
}

/**
 * Visual tokens of BubbleSearch, written as CSS custom properties `--bubble-search-*`.
 * Numbers are px for lengths and ms for `duration`. Structure and layout are not customizable.
 */
export interface BubbleSearchTokens {
  /** Expanded width, capped to the viewport. @default 360px */
  width?: number | string;
  /** Corner radius of the expanded search. @default 24px */
  radius?: number | string;
  /** Divider between the header and the results. @default rgb(128 128 128 / 18%) */
  divider?: string;
  /** Focus ring of the header. @default #818cf8 */
  focusRing?: string;
  /** Background of the hovered / active option. @default rgb(129 140 248 / 18%) */
  optionActiveBg?: string;
  /** @default 12px */
  optionRadius?: number | string;
  /** Option title size, clamped to 10–20px. @default 13px */
  titleSize?: number | string;
  /** @default 600 */
  titleWeight?: number | string;
  /** Size of descriptions, status and hint, clamped to 9–16px. @default 11px */
  metaSize?: number | string;
  /** Opacity of secondary texts, clamped to 0.4–1. @default 0.7 */
  mutedOpacity?: number | string;
  /** Results max height, capped to the viewport. @default 220px */
  resultsMaxHeight?: number | string;
  /** Panel padding, clamped to 0–16px. @default 8px */
  panelPadding?: number | string;
  /** Expand / collapse duration, clamped to 0–600ms. @default 180ms */
  duration?: number | string;
  /** @default ease */
  easing?: string;
}

export interface BubbleSearchProps<T extends BubbleSearchItem = BubbleSearchItem> {
  /**
   * Async search. Receives the trimmed, lower-cased query and an AbortSignal that is
   * aborted when the query changes, the search closes or the component unmounts.
   */
  onSearch: (query: string, signal: AbortSignal) => Promise<T[]>;
  /** Called when an option is chosen. The search closes and focus returns to the button. */
  onSelect: (item: T) => void;
  /** Shown while the query is empty and when nothing matches. */
  suggestions?: T[];
  /** Receives errors from onSearch, except cancellations. The status then shows no results. */
  onError?: (error: unknown) => void;
  /** Controlled open state. */
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Wait before searching. 0 searches immediately. @default 0 */
  debounceMs?: number;
  labels?: Partial<BubbleSearchLabels>;
  tokens?: BubbleSearchTokens;
  /** Class for the search group, useful to scope tokens in CSS. */
  className?: string;
}

/** A breadcrumb level. The last item is the current page. */
export interface BubbleBreadcrumbItem {
  label: string;
  href?: string;
}

export interface BubbleBreadcrumbSearchLabels extends BubbleSearchLabels {
  /** Accessible name of the breadcrumb navigation. @default 'Breadcrumb' */
  location: string;
}

/** BubbleSearch tokens plus `--bubble-breadcrumb-*` tokens. */
export interface BubbleBreadcrumbSearchTokens extends BubbleSearchTokens {
  /** Breadcrumb text size, clamped to 10–16px. @default 12px */
  breadcrumbSize?: number | string;
  /** @default currentColor */
  breadcrumbSeparatorColor?: string;
  /** Weight of the current page. @default 500 */
  breadcrumbCurrentWeight?: number | string;
  /** Opacity of parent levels, clamped to 0.4–1. @default 0.7 */
  breadcrumbMutedOpacity?: number | string;
}

export interface BubbleBreadcrumbSearchProps<T extends BubbleSearchItem = BubbleSearchItem>
  extends Omit<BubbleSearchProps<T>, 'labels' | 'tokens'> {
  /** Current location, controlled by the app (usually its router). */
  items: BubbleBreadcrumbItem[];
  /** Text between levels. @default '/' */
  separator?: string;
  labels?: Partial<BubbleBreadcrumbSearchLabels>;
  tokens?: BubbleBreadcrumbSearchTokens;
}
