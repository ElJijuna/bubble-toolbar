import { createContext, useContext } from 'react';
import type { BubbleToolbarSize, BubbleToolbarTheme } from './types';

export interface BubbleToolbarContextValue {
  size: BubbleToolbarSize;
  theme: BubbleToolbarTheme;
  blurred: boolean;
  blurAmount: number | string;
  itemGap: number | string;
  bordered: boolean;
  shadow: boolean | string;
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
