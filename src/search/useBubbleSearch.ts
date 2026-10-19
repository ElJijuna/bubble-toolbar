import type { KeyboardEvent, RefObject } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useBubbleActivity } from '../activity';
import type { BubbleSearchItem, BubbleSearchProps } from '../types';

export const normalizeQuery = (query: string): string => query.trim().toLowerCase();

const useLatest = <V>(value: V) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

interface UseBubbleSearchOptions<T extends BubbleSearchItem>
  extends Pick<BubbleSearchProps<T>, 'onSearch' | 'onSelect' | 'onError' | 'suggestions'> {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupRef: RefObject<HTMLDivElement | null>;
  debounceMs: number;
}

/** Search state, async lifecycle, keyboard and focus handling shared by the search components. */
export function useBubbleSearch<T extends BubbleSearchItem>({
  open,
  setOpen,
  groupRef,
  onSearch,
  onSelect,
  onError,
  suggestions = [],
  debounceMs,
}: UseBubbleSearchOptions<T>) {
  const { run } = useBubbleActivity();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ query: string; items: T[] } | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const hintId = useId();
  const onSearchRef = useLatest(onSearch);
  const onSelectRef = useLatest(onSelect);
  const onErrorRef = useLatest(onError);

  const normalizedQuery = normalizeQuery(query);
  const pending = Boolean(normalizedQuery && result?.query !== normalizedQuery);
  const noResults = Boolean(normalizedQuery && !pending && result?.items.length === 0);
  const options = pending
    ? []
    : normalizedQuery && !noResults
      ? (result?.items ?? [])
      : suggestions;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const close = useCallback(
    (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) {
        buttonRef.current?.focus();
      }
    },
    [setOpen],
  );

  // Closing, from inside or from a controlled `open`, always starts the next search clean.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResult(null);
      setActiveIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !groupRef.current?.contains(event.target)) {
        close();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, close, groupRef]);

  useEffect(() => {
    if (!open || !normalizedQuery) {
      return;
    }
    const controller = new AbortController();
    const search = async () => {
      try {
        const items = await run(() => onSearchRef.current(normalizedQuery, controller.signal));
        if (!controller.signal.aborted) {
          setResult({ query: normalizedQuery, items });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          onErrorRef.current?.(error);
          setResult({ query: normalizedQuery, items: [] });
        }
      }
    };
    if (debounceMs > 0) {
      const timer = setTimeout(() => void search(), debounceMs);
      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
    void search();
    return () => controller.abort();
  }, [open, normalizedQuery, run, debounceMs, onSearchRef, onErrorRef]);

  useEffect(() => {
    if (activeIndex >= 0) {
      document
        .getElementById(listId)
        ?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeIndex, listId]);

  const select = (item: T) => {
    onSelectRef.current(item);
    close(true);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (normalizeQuery(value) !== normalizedQuery) {
      setResult(null);
    }
    setActiveIndex(-1);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) =>
        index < 0
          ? direction === 1
            ? 0
            : options.length - 1
          : (index + direction + options.length) % options.length,
      );
    } else if (event.key === 'Enter' && options[activeIndex]) {
      event.preventDefault();
      select(options[activeIndex]);
    }
  };

  return {
    query,
    changeQuery,
    normalizedQuery,
    pending,
    noResults,
    options,
    activeIndex,
    setActiveIndex,
    activeDescendant: activeIndex >= 0 && options[activeIndex] ? optionId(activeIndex) : undefined,
    optionId,
    listId,
    hintId,
    inputRef,
    buttonRef,
    close,
    select,
    handleInputKeyDown,
  };
}
