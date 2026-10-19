import { useState } from 'react';
import type {
  BubbleBreadcrumbItem,
  BubbleBreadcrumbSearchLabels,
  BubbleToolbarProps,
} from '../../src';
import { BubbleIconButton, BubbleToolbar } from '../../src';
import './breadcrumb-search.css';

type Page = { id: string; title: string; description: string };
const PAGES: Page[] = [
  { id: 'overview', title: 'Overview', description: 'Projects / Bubble Toolbar / Overview' },
  { id: 'components', title: 'Components', description: 'Projects / Bubble Toolbar / Components' },
  {
    id: 'activity',
    title: 'Async activity',
    description: 'Projects / Bubble Toolbar / Guides / Async activity',
  },
  { id: 'themes', title: 'Themes', description: 'Projects / Bubble Toolbar / Design / Themes' },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: 'Projects / Bubble Toolbar / Guides / Accessibility',
  },
  {
    id: 'storybook',
    title: 'Storybook',
    description: 'Projects / Bubble Toolbar / Examples / Storybook',
  },
  { id: 'releases', title: 'Releases', description: 'Projects / Bubble Toolbar / Releases' },
  {
    id: 'settings',
    title: 'Project settings',
    description: 'Projects / Bubble Toolbar / Settings',
  },
];
const SUGGESTIONS = PAGES.slice(0, 3);

const LABELS: Partial<BubbleBreadcrumbSearchLabels> = {
  group: 'Page search',
  button: 'Search pages',
  input: 'Search project pages',
  listbox: 'Project pages',
  location: 'Current page',
  placeholder: 'Search pages…',
  noResults: 'No results. Try another term or explore a suggested page.',
  suggestions: 'Suggested pages',
};

const toBreadcrumb = (page: Page): BubbleBreadcrumbItem[] =>
  page.description.split(' / ').map((label) => ({ label }));

const searchPages = (query: string, signal: AbortSignal): Promise<Page[]> =>
  new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Search cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve(
        PAGES.filter((page) => `${page.title} ${page.description}`.toLowerCase().includes(query)),
      );
    }, 400);
    signal.addEventListener('abort', abort, { once: true });
  });

const SearchGroup = () => {
  const [location, setLocation] = useState(() => toBreadcrumb(PAGES[0]));
  return (
    <BubbleToolbar.BreadcrumbSearch<Page>
      items={location}
      suggestions={SUGGESTIONS}
      onSearch={searchPages}
      onSelect={(page) => setLocation(toBreadcrumb(page))}
      labels={LABELS}
    />
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
