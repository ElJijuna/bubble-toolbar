import type { ReactElement, RefAttributes } from 'react';
import { forwardRef } from 'react';
import type { BubbleSearchItem, BubbleSearchProps } from '../types';
import { defaultSearchLabels, SearchBase } from './SearchBase';

const BubbleSearchInner = forwardRef<HTMLDivElement, BubbleSearchProps>(
  ({ labels, ...props }, ref) => (
    <SearchBase {...props} labels={{ ...defaultSearchLabels, ...labels }} forwardedRef={ref} />
  ),
);

BubbleSearchInner.displayName = 'BubbleSearch';

/**
 * Search bubble: a button that expands into a combobox with async results.
 * Use it inside BubbleToolbar. Customize it through `labels` and `tokens`.
 */
export const BubbleSearch = BubbleSearchInner as (<T extends BubbleSearchItem>(
  props: BubbleSearchProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };
