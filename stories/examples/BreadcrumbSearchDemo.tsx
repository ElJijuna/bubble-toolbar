import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { BubbleToolbarProps } from '../../src';
import { BubbleArea, BubbleIconButton, BubbleToolbar, useBubbleActivity } from '../../src';
import './breadcrumb-search.css';

type Page = { id: string; title: string; breadcrumb: string };
const PAGES: Page[] = [
  { id: 'overview', title: 'Overview', breadcrumb: 'Projects / Bubble Toolbar / Overview' },
  { id: 'components', title: 'Components', breadcrumb: 'Projects / Bubble Toolbar / Components' },
  {
    id: 'activity',
    title: 'Async activity',
    breadcrumb: 'Projects / Bubble Toolbar / Guides / Async activity',
  },
  { id: 'themes', title: 'Themes', breadcrumb: 'Projects / Bubble Toolbar / Design / Themes' },
  {
    id: 'accessibility',
    title: 'Accessibility',
    breadcrumb: 'Projects / Bubble Toolbar / Guides / Accessibility',
  },
  {
    id: 'storybook',
    title: 'Storybook',
    breadcrumb: 'Projects / Bubble Toolbar / Examples / Storybook',
  },
  { id: 'releases', title: 'Releases', breadcrumb: 'Projects / Bubble Toolbar / Releases' },
  { id: 'settings', title: 'Project settings', breadcrumb: 'Projects / Bubble Toolbar / Settings' },
];
const SUGGESTIONS = PAGES.slice(0, 3);

const searchPages = (query: string, signal: AbortSignal): Promise<Page[]> =>
  new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Search cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve(
        PAGES.filter((page) => `${page.title} ${page.breadcrumb}`.toLowerCase().includes(query)),
      );
    }, 400);
    signal.addEventListener('abort', abort, { once: true });
  });

type SearchBodyProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  groupRef: RefObject<HTMLDivElement | null>;
};

const SearchBody = ({ open, setOpen, groupRef }: SearchBodyProps) => {
  const { run } = useBubbleActivity();
  const [breadcrumb, setBreadcrumb] = useState(PAGES[0].breadcrumb);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ query: string; pages: Page[] } | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const hintId = useId();
  const normalizedQuery = query.trim().toLowerCase();
  const pending = Boolean(normalizedQuery && result?.query !== normalizedQuery);
  const noResults = Boolean(normalizedQuery && !pending && result?.pages.length === 0);
  const options = pending
    ? []
    : normalizedQuery && !noResults
      ? (result?.pages ?? [])
      : SUGGESTIONS;

  const close = useCallback(
    (restoreFocus = false) => {
      setOpen(false);
      setQuery('');
      setResult(null);
      setActiveIndex(-1);
      if (restoreFocus) {
        buttonRef.current?.focus();
      }
    },
    [setOpen],
  );

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
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
        const pages = await run(() => searchPages(normalizedQuery, controller.signal));
        if (!controller.signal.aborted) {
          setResult({ query: normalizedQuery, pages });
        }
      } catch {
        // The local mock only rejects when an obsolete search is cancelled.
      }
    };
    void search();
    return () => controller.abort();
  }, [open, normalizedQuery, run]);

  useEffect(() => {
    if (activeIndex >= 0) {
      document
        .getElementById(listId)
        ?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeIndex, listId]);

  const select = (page: Page) => {
    setBreadcrumb(page.breadcrumb);
    close(true);
  };

  return (
    <div
      className="breadcrumb-search-body"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          close();
        }
      }}
    >
      <div className="breadcrumb-search-header">
        <BubbleIconButton
          ref={buttonRef}
          name="search"
          ariaLabel="Search pages"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          active={open}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
              event.preventDefault();
              close(true);
            }
          }}
          onClick={() => {
            if (!open) {
              setOpen(true);
            } else {
              inputRef.current?.focus();
            }
          }}
        />
        <BubbleArea minWidth={0} className="breadcrumb-search-area">
          {open ? (
            <input
              ref={inputRef}
              className="breadcrumb-search-input"
              type="text"
              role="combobox"
              aria-label="Search project pages"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              aria-describedby={hintId}
              aria-activedescendant={
                activeIndex >= 0 && options[activeIndex]
                  ? `${listId}-${options[activeIndex].id}`
                  : undefined
              }
              autoComplete="off"
              placeholder="Search pages…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value.trim().toLowerCase() !== normalizedQuery) {
                  setResult(null);
                }
                setActiveIndex(-1);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  close(true);
                } else if (
                  (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
                  options.length
                ) {
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
              }}
            />
          ) : (
            <nav
              aria-label="Current page"
              className="breadcrumb-search-location"
              title={breadcrumb}
            >
              {breadcrumb}
            </nav>
          )}
        </BubbleArea>
      </div>
      <div className="breadcrumb-search-expansion" data-open={open} aria-hidden={!open}>
        <div className="breadcrumb-search-expansion-inner">
          <div className="breadcrumb-search-panel">
            <div className="breadcrumb-search-status" role="status" aria-live="polite">
              {pending
                ? 'Searching…'
                : noResults
                  ? 'No results. Try another term or explore a suggested page.'
                  : normalizedQuery
                    ? `${options.length} results`
                    : 'Suggested pages'}
            </div>
            <div
              id={listId}
              role="listbox"
              aria-label="Project pages"
              className="breadcrumb-search-results"
            >
              {options.map((page, index) => (
                <div
                  key={page.id}
                  id={`${listId}-${page.id}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={activeIndex === index}
                  className="breadcrumb-search-option"
                  onPointerDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => select(page)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      select(page);
                    }
                  }}
                >
                  <span className="breadcrumb-search-option-title">{page.title}</span>
                  <span className="breadcrumb-search-option-path">{page.breadcrumb}</span>
                </div>
              ))}
            </div>
            <p id={hintId} className="breadcrumb-search-hint">
              ↑ ↓ to explore · Enter to select · Esc to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchGroup = () => {
  const [open, setOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  return (
    <BubbleToolbar.Group
      ref={groupRef}
      aria-label="Page search"
      shape="pill"
      className="breadcrumb-search-group"
      data-expanded={open}
      style={{
        height: 'auto',
        width: 'min(360px, calc(100vw - 96px))',
        minWidth: 0,
        padding: 0,
        gap: 0,
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: 24,
      }}
    >
      <SearchBody open={open} setOpen={setOpen} groupRef={groupRef} />
    </BubbleToolbar.Group>
  );
};

export const BreadcrumbSearchDemo = (args: BubbleToolbarProps) => (
  <main className="breadcrumb-search-demo" data-theme={args.theme ?? 'glass'}>
    <BubbleToolbar
      {...args}
      position="top"
      size="md"
      className="breadcrumb-search-toolbar"
      style={{ alignItems: 'flex-start', top: 32 }}
    >
      <BubbleToolbar.Group>
        <BubbleIconButton name="logo" ariaLabel="Project home" />
      </BubbleToolbar.Group>
      <SearchGroup />
      <BubbleToolbar.Group>
        <BubbleIconButton name="theme" ariaLabel="Change theme" />
      </BubbleToolbar.Group>
      <BubbleToolbar.Group>
        <BubbleIconButton name="chat" ariaLabel="Open messages" />
      </BubbleToolbar.Group>
      <BubbleToolbar.Group>
        <BubbleIconButton name="notifications" ariaLabel="Open notifications" badge={3} />
      </BubbleToolbar.Group>
    </BubbleToolbar>
    <section className="breadcrumb-search-intro">
      <span className="breadcrumb-search-eyebrow">YOUR WORKSPACE, ONE SEARCH AWAY</span>
      <h1>
        A little context.
        <br />A world to explore.
      </h1>
      <p>
        Your current page stays in view. Press the search icon to discover project pages without
        leaving your workspace.
      </p>
      <button type="button" className="breadcrumb-search-outside">
        Continue working
      </button>
    </section>
  </main>
);
