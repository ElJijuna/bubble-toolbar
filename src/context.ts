import { createContext, useContext } from 'react';
import type {
  BubbleActivityProps,
  BubbleLiveActivityController,
  BubbleToolbarPosition,
  BubbleToolbarSize,
  BubbleToolbarTheme,
} from './types';

export interface BubbleToolbarContextValue extends BubbleActivityProps {
  size: BubbleToolbarSize;
  theme: BubbleToolbarTheme;
  blurred: boolean;
  blurAmount: number | string;
  itemGap: number | string;
  bordered: boolean;
  shadow: boolean | string;
  /** Toolbar placement; undefined outside a BubbleToolbar. */
  position?: BubbleToolbarPosition;
  /** Live Activity controller of the toolbar, if any. */
  liveActivity?: BubbleLiveActivityController;
}

export const defaultContextValue: BubbleToolbarContextValue = {
  size: 'md',
  theme: 'glass',
  blurred: true,
  blurAmount: 16,
  itemGap: 8,
  bordered: true,
  shadow: true,
};

export const BubbleToolbarContext = createContext<BubbleToolbarContextValue>(defaultContextValue);

export const useBubbleToolbar = (): BubbleToolbarContextValue => {
  return useContext(BubbleToolbarContext);
};
