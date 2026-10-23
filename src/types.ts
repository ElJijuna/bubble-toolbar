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
   * Amount of backdrop blur in pixels or CSS string. Negative numbers are clamped to 0.
   * When omitted, the `--bubble-blur` CSS token is used (16px by default).
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

  /**
   * Controller from useBubbleLiveActivity. While an activity is shown, the groups collapse
   * into a single pill (and then a card) and are restored afterwards, keeping their state.
   */
  liveActivity?: BubbleLiveActivityController;
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

/** Content of a Live Activity. Its shape is fixed so the pill and the card keep their layout. */
export interface BubbleLiveContent {
  title: string;
  description?: string;
  /** Replaces the default spinner / outcome icon. */
  icon?: ReactNode;
  /** @default 'success' after a resolved task, 'error' after a rejected one, otherwise 'neutral' */
  tone?: 'neutral' | 'success' | 'error';
}

export type BubbleLiveState = 'idle' | 'compact' | 'expanded';

export interface BubbleLiveRunOptions<T> {
  /** Shown in the compact pill while the task runs. Defaults to `labels.pending`. */
  pending?: BubbleLiveContent;
  /** Card shown when the task resolves. Defaults to `labels.success`. */
  success?: (value: T) => BubbleLiveContent;
  /** Card shown when the task rejects. Defaults to `labels.error`. */
  error?: (error: unknown) => BubbleLiveContent;
  /** Milliseconds the card stays visible; 0 keeps it until dismissed. Defaults to the controller's. */
  duration?: number;
}

/** Texts of the Live Activity. */
export interface BubbleLiveLabels {
  /** @default 'Working…' */
  pending: string;
  /** @default 'Done' */
  success: string;
  /** @default 'Something went wrong' */
  error: string;
  /** Accessible name of the close button. @default 'Dismiss' */
  close: string;
  /** Accessible name of the live group. @default 'Live activity' */
  group: string;
}

/**
 * Visual tokens of the Live Activity, written as `--bubble-live-*` custom properties.
 * Numbers are px for lengths and ms for `duration`.
 */
export interface BubbleLiveTokens {
  /** Width of the compact pill, capped to the viewport. @default 200px */
  compactWidth?: number | string;
  /** Width of the card, capped to the viewport. @default 360px */
  width?: number | string;
  /** Corner radius of the card. @default 24px */
  radius?: number | string;
  /** Remaining-time bar. @default currentColor at 40% */
  progressColor?: string;
  /** @default #22c55e */
  successColor?: string;
  /** @default #ef4444 */
  errorColor?: string;
  /** Title size, clamped to 11–18px. @default 13px */
  titleSize?: number | string;
  /** Description size, clamped to 9–14px. @default 11px */
  metaSize?: number | string;
  /** Morph duration, clamped to 0–600ms. @default 320ms */
  duration?: number | string;
}

export interface BubbleLiveActivityOptions {
  /** Default card duration in ms; 0 keeps cards until dismissed. @default 4000 */
  duration?: number;
  /** Minimum time the compact pill stays, so fast tasks do not flicker. @default 600 */
  minPendingMs?: number;
  labels?: Partial<BubbleLiveLabels>;
  tokens?: BubbleLiveTokens;
}

/** Controller returned by useBubbleLiveActivity. Stable across renders; usable from anywhere. */
export interface BubbleLiveActivityController {
  /** Shows the task in the toolbar and returns its own promise (value or original error). */
  run: <T>(task: () => Promise<T> | T, options?: BubbleLiveRunOptions<T>) => Promise<T>;
  /** Queues a card without a task. */
  show: (content: BubbleLiveContent, options?: { duration?: number }) => void;
  /** Closes the current activity and moves to the next queued one. */
  dismiss: () => void;
  /** Current state, for tests or custom UI. Not reactive; subscribe for updates. */
  readonly state: BubbleLiveState;
  subscribe: (listener: () => void) => () => void;
}
