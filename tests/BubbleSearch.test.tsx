import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import type { BubbleSearchItem, BubbleSearchProps } from '../src';
import { BubbleSearch, BubbleToolbar } from '../src';
import { tokensToStyle } from '../src/search/tokens';

const ITEMS: BubbleSearchItem[] = [
  { id: 'a', title: 'Alpha', description: 'First' },
  { id: 'b', title: 'Beta' },
];

const renderSearch = (props: Partial<BubbleSearchProps> = {}) => {
  const onSelect = jest.fn();
  const onSearch = jest.fn((query: string) =>
    Promise.resolve(ITEMS.filter((item) => item.title.toLowerCase().includes(query))),
  );
  const utils = render(
    <BubbleToolbar position="static">
      <BubbleSearch onSearch={onSearch} onSelect={onSelect} suggestions={ITEMS} {...props} />
    </BubbleToolbar>,
  );
  return { ...utils, onSelect, onSearch, group: screen.getByRole('group', { name: 'Search' }) };
};

const flush = () => act(async () => {});

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('BubbleSearch', () => {
  it('is a compact circle while closed and expands into a combobox', () => {
    const { group } = renderSearch();
    expect(group).toHaveAttribute('data-expanded', 'false');
    expect(group).toHaveAttribute('data-compact', 'true');
    expect(group.style.width).toBe('48px');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(group).toHaveAttribute('data-expanded', 'true');
    expect(group).toHaveAttribute('data-compact', 'false');
    expect(screen.getByRole('combobox', { name: 'Search' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Suggestions');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('passes the normalized query, shows results and selects with the keyboard', async () => {
    const { onSearch, onSelect } = renderSearch();
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '  BET ' } });
    expect(screen.getByRole('status')).toHaveTextContent('Searching…');
    await flush();
    expect(onSearch).toHaveBeenCalledWith('bet', expect.any(AbortSignal));
    expect(screen.getByRole('status')).toHaveTextContent('1 result');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1]);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
  });

  it('reports search errors and shows the no-results state', async () => {
    const onError = jest.fn();
    const error = new Error('offline');
    renderSearch({ onSearch: () => Promise.reject(error), onError });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'x' } });
    await flush();
    expect(onError).toHaveBeenCalledWith(error);
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('debounces searches when debounceMs is set', async () => {
    const { onSearch } = renderSearch({ debounceMs: 200 });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'al' } });
    await act(async () => {
      jest.advanceTimersByTime(199);
    });
    expect(onSearch).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('al', expect.any(AbortSignal));
  });

  it('supports controlled open state', () => {
    const onOpenChange = jest.fn();
    const { rerender } = renderSearch({ open: false, onOpenChange });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    rerender(
      <BubbleToolbar position="static">
        <BubbleSearch onSearch={jest.fn()} onSelect={jest.fn()} open onOpenChange={onOpenChange} />
      </BubbleToolbar>,
    );
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('applies custom labels and forwards the group ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BubbleToolbar>
        <BubbleToolbar.Search
          ref={ref}
          defaultOpen
          onSearch={jest.fn()}
          onSelect={jest.fn()}
          labels={{ group: 'Find', input: 'Find docs', placeholder: 'Type…' }}
        />
      </BubbleToolbar>,
    );
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Find' }));
    expect(screen.getByRole('combobox', { name: 'Find docs' })).toHaveAttribute(
      'placeholder',
      'Type…',
    );
  });

  it('writes tokens as CSS custom properties and keeps the structure fixed', () => {
    const { group } = renderSearch({
      tokens: { width: 420, radius: '12px', optionActiveBg: 'hotpink', duration: 90 },
      className: 'brand-search',
    });
    expect(group).toHaveClass('bubble-search', 'brand-search');
    expect(group.style.getPropertyValue('--bubble-search-width')).toBe('420px');
    expect(group.style.getPropertyValue('--bubble-search-radius')).toBe('12px');
    expect(group.style.getPropertyValue('--bubble-search-option-active-bg')).toBe('hotpink');
    expect(group.style.getPropertyValue('--bubble-search-duration')).toBe('90ms');
    expect(group.style.flexDirection).toBe('column');
    expect(group.style.height).toBe('auto');
  });
});

describe('BubbleSearch placement', () => {
  it('collapses the panel inline, so it stays hidden without styles.css', () => {
    renderSearch();
    const expansion = document.querySelector<HTMLElement>('.bubble-search__expansion');
    expect(expansion?.style.visibility).toBe('hidden');
    expect(expansion?.style.gridTemplateRows).toBe('0fr');
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(expansion?.style.visibility).toBe('visible');
    expect(expansion?.style.gridTemplateRows).toBe('1fr');
  });

  it('opens upward in bottom toolbars and downward otherwise', () => {
    const { rerender } = render(
      <BubbleToolbar>
        <BubbleSearch onSearch={jest.fn()} onSelect={jest.fn()} />
      </BubbleToolbar>,
    );
    const body = () => document.querySelector<HTMLElement>('.bubble-search__body');
    expect(body()).toHaveAttribute('data-placement', 'top');
    expect(body()?.style.flexDirection).toBe('column-reverse');
    rerender(
      <BubbleToolbar position="top">
        <BubbleSearch onSearch={jest.fn()} onSelect={jest.fn()} />
      </BubbleToolbar>,
    );
    expect(body()).toHaveAttribute('data-placement', 'bottom');
    expect(body()?.style.flexDirection).toBe('column');
  });
});

describe('tokensToStyle', () => {
  it('ignores unknown, inherited and empty keys', () => {
    const tokens = JSON.parse(
      '{"width": 300, "background": "red", "toString": "x", "__proto__": {"radius": 1}, "easing": null}',
    );
    expect(tokensToStyle(tokens)).toEqual({ '--bubble-search-width': '300px' });
    expect(tokensToStyle(undefined)).toEqual({});
  });

  it('keeps unitless tokens unitless', () => {
    expect(tokensToStyle({ titleWeight: 700, mutedOpacity: 0.5 })).toEqual({
      '--bubble-search-title-weight': '700',
      '--bubble-search-muted-opacity': '0.5',
    });
  });
});
