import type { CSSProperties, ForwardedRef, ReactNode, RefObject } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BubbleGroup } from '../BubbleGroup';
import { BubbleArea } from '../components/BubbleArea';
import { BubbleIconButton } from '../components/BubbleIconButton';
import { useBubbleToolbar } from '../context';
import type {
  BubbleBreadcrumbSearchTokens,
  BubbleSearchItem,
  BubbleSearchLabels,
  BubbleSearchProps,
} from '../types';
import { resolveSize } from '../utils/styles';
import { tokensToStyle } from './tokens';
import { useBubbleSearch } from './useBubbleSearch';

export const defaultSearchLabels: BubbleSearchLabels = {
  group: 'Search',
  button: 'Search',
  input: 'Search',
  listbox: 'Results',
  placeholder: 'Search…',
  searching: 'Searching…',
  noResults: 'No results. Try another term or explore a suggestion.',
  suggestions: 'Suggestions',
  results: (count) => `${count} ${count === 1 ? 'result' : 'results'}`,
  hint: '↑ ↓ to explore · Enter to select · Esc to close',
};

const mergeRefs =
  <V,>(...refs: (ForwardedRef<V> | RefObject<V | null>)[]) =>
  (value: V | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    }
  };

interface SearchBaseProps<T extends BubbleSearchItem>
  extends Omit<BubbleSearchProps<T>, 'labels' | 'tokens'> {
  labels: BubbleSearchLabels;
  tokens?: BubbleBreadcrumbSearchTokens;
  /** Content shown next to the button while closed. Without it, the closed search is a circle. */
  idleContent?: ReactNode;
  forwardedRef: ForwardedRef<HTMLDivElement>;
}

type SearchBodyProps<T extends BubbleSearchItem> = Omit<
  SearchBaseProps<T>,
  'open' | 'defaultOpen' | 'onOpenChange' | 'tokens' | 'className' | 'forwardedRef'
> & {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupRef: RefObject<HTMLDivElement | null>;
  headerHeight: number;
  /** Bottom toolbars open the panel upward, away from the screen edge. */
  upward: boolean;
};

const SearchBody = <T extends BubbleSearchItem>({
  open,
  setOpen,
  groupRef,
  headerHeight,
  upward,
  labels,
  idleContent,
  onSearch,
  onSelect,
  onError,
  suggestions,
  debounceMs = 0,
}: SearchBodyProps<T>) => {
  const search = useBubbleSearch({
    open,
    setOpen,
    groupRef,
    onSearch,
    onSelect,
    onError,
    suggestions,
    debounceMs,
  });
  const { options, activeIndex, listId, hintId } = search;
  const compact = !open && idleContent === undefined;

  return (
    <div
      className="bubble-search__body"
      data-placement={upward ? 'top' : 'bottom'}
      style={{ display: 'flex', flexDirection: upward ? 'column-reverse' : 'column', minWidth: 0 }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          search.close();
        }
      }}
    >
      <div
        className="bubble-search__header"
        data-compact={compact}
        style={{ height: `${headerHeight}px` }}
      >
        <BubbleIconButton
          ref={search.buttonRef}
          name="search"
          ariaLabel={labels.button}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          active={open}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
              event.preventDefault();
              search.close(true);
            }
          }}
          onClick={() => {
            if (!open) {
              setOpen(true);
            } else {
              search.inputRef.current?.focus();
            }
          }}
        />
        {compact ? null : (
          <BubbleArea minWidth={0} className="bubble-search__area">
            {open ? (
              <input
                ref={search.inputRef}
                className="bubble-search__input"
                type="text"
                role="combobox"
                aria-label={labels.input}
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listId}
                aria-describedby={hintId}
                aria-activedescendant={search.activeDescendant}
                autoComplete="off"
                placeholder={labels.placeholder}
                value={search.query}
                onChange={(event) => search.changeQuery(event.target.value)}
                onKeyDown={search.handleInputKeyDown}
              />
            ) : (
              idleContent
            )}
          </BubbleArea>
        )}
      </div>
      {/* Collapse is inline so it works without styles.css and cannot be overridden. */}
      <div
        className="bubble-search__expansion"
        data-open={open}
        aria-hidden={!open}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          visibility: open ? 'visible' : 'hidden',
          opacity: open ? 1 : 0,
        }}
      >
        <div
          className="bubble-search__expansion-inner"
          style={{ minHeight: 0, overflow: 'hidden' }}
        >
          <div className="bubble-search__panel">
            <div className="bubble-search__status" role="status" aria-live="polite">
              {search.pending
                ? labels.searching
                : search.noResults
                  ? labels.noResults
                  : search.normalizedQuery
                    ? labels.results(options.length)
                    : labels.suggestions}
            </div>
            <div
              id={listId}
              role="listbox"
              aria-label={labels.listbox}
              className="bubble-search__results"
            >
              {options.map((item, index) => (
                <div
                  key={item.id}
                  id={search.optionId(index)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={activeIndex === index}
                  className="bubble-search__option"
                  onPointerDown={(event) => event.preventDefault()}
                  onMouseMove={() => search.setActiveIndex(index)}
                  onClick={() => search.select(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      search.select(item);
                    }
                  }}
                >
                  <span className="bubble-search__option-title">{item.title}</span>
                  {item.description ? (
                    <span className="bubble-search__option-description">{item.description}</span>
                  ) : null}
                </div>
              ))}
            </div>
            <p id={hintId} className="bubble-search__hint">
              {labels.hint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Group, open state and structural layout. Only tokens change the look. */
export const SearchBase = <T extends BubbleSearchItem>({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  tokens,
  className = '',
  forwardedRef,
  ...bodyProps
}: SearchBaseProps<T>) => {
  const context = useBubbleToolbar();
  const groupRef = useRef<HTMLDivElement>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : innerOpen;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setInnerOpen(next);
      }
      onOpenChangeRef.current?.(next);
    },
    [controlled],
  );

  const ref = useMemo(() => mergeRefs(groupRef, forwardedRef), [forwardedRef]);
  const size = resolveSize(context.size);
  const compact = !open && bodyProps.idleContent === undefined;
  const style: CSSProperties = {
    ...tokensToStyle(tokens),
    height: 'auto',
    width: compact ? `${size}px` : 'min(var(--bubble-search-width, 360px), calc(100vw - 96px))',
    minWidth: 0,
    padding: 0,
    gap: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: 'var(--bubble-search-radius, 24px)',
  };

  return (
    <BubbleGroup
      ref={ref}
      aria-label={bodyProps.labels.group}
      shape="pill"
      className={`bubble-search ${className}`.trim()}
      data-expanded={open}
      data-compact={compact}
      style={style}
    >
      <SearchBody
        {...bodyProps}
        open={open}
        setOpen={setOpen}
        groupRef={groupRef}
        headerHeight={size - (context.bordered ? 2 : 0)}
        upward={context.position === 'bottom'}
      />
    </BubbleGroup>
  );
};
