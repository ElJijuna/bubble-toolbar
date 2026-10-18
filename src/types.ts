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
