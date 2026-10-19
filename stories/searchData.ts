import type { BubbleSearchItem } from '../src';

export const DOCS: BubbleSearchItem[] = [
  { id: 'overview', title: 'Overview', description: 'Docs / Overview' },
  { id: 'install', title: 'Installation', description: 'Docs / Getting started / Installation' },
  { id: 'activity', title: 'Async activity', description: 'Docs / Guides / Async activity' },
  { id: 'themes', title: 'Themes', description: 'Docs / Design / Themes' },
  { id: 'tokens', title: 'Design tokens', description: 'Docs / Design / Tokens' },
];

export const searchDocs = (query: string, signal: AbortSignal): Promise<BubbleSearchItem[]> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          DOCS.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query)),
        ),
      350,
    );
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Search cancelled', 'AbortError'));
    });
  });
