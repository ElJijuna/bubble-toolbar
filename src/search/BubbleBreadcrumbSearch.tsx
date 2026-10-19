import type { ReactElement, RefAttributes } from 'react';
import { forwardRef } from 'react';
import type { BubbleBreadcrumbItem, BubbleBreadcrumbSearchProps, BubbleSearchItem } from '../types';
import { defaultSearchLabels, SearchBase } from './SearchBase';

const BreadcrumbLevel = ({ item, current }: { item: BubbleBreadcrumbItem; current: boolean }) =>
  item.href ? (
    <a href={item.href} aria-current={current ? 'page' : undefined}>
      {item.label}
    </a>
  ) : (
    <span aria-current={current ? 'page' : undefined}>{item.label}</span>
  );

const Breadcrumb = ({
  items,
  separator,
  label,
}: {
  items: BubbleBreadcrumbItem[];
  separator: string;
  label: string;
}) => {
  const parents = items.slice(0, -1);
  const current = items[items.length - 1];
  const divider = (
    <span className="bubble-breadcrumb__separator" aria-hidden="true">
      {` ${separator} `}
    </span>
  );

  return (
    <nav
      aria-label={label}
      className="bubble-breadcrumb"
      title={items.map((item) => item.label).join(` ${separator} `)}
    >
      {parents.length > 0 ? (
        <>
          <span className="bubble-breadcrumb__parents">
            {parents.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Breadcrumb levels are identified by position.
              <span key={index}>
                <BreadcrumbLevel item={item} current={false} />
                {index < parents.length - 1 ? divider : null}
              </span>
            ))}
          </span>
          {divider}
        </>
      ) : null}
      {current ? (
        <span className="bubble-breadcrumb__current">
          <BreadcrumbLevel item={current} current />
        </span>
      ) : null}
    </nav>
  );
};

const BubbleBreadcrumbSearchInner = forwardRef<HTMLDivElement, BubbleBreadcrumbSearchProps>(
  ({ items, separator = '/', labels, ...props }, ref) => {
    const { location = 'Breadcrumb', ...searchLabels } = labels ?? {};
    return (
      <SearchBase
        {...props}
        labels={{ ...defaultSearchLabels, ...searchLabels }}
        idleContent={<Breadcrumb items={items} separator={separator} label={location} />}
        forwardedRef={ref}
      />
    );
  },
);

BubbleBreadcrumbSearchInner.displayName = 'BubbleBreadcrumbSearch';

/**
 * Shows the current location as a breadcrumb and turns into a search when its button is pressed.
 * The last item is the current page; it stays visible while parents truncate first.
 */
export const BubbleBreadcrumbSearch = BubbleBreadcrumbSearchInner as (<T extends BubbleSearchItem>(
  props: BubbleBreadcrumbSearchProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };
