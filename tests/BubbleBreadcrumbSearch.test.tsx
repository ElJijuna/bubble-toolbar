import { fireEvent, render, screen } from '@testing-library/react';
import type { BubbleBreadcrumbSearchProps } from '../src';
import { BubbleBreadcrumbSearch, BubbleToolbar } from '../src';

const renderBreadcrumb = (props: Partial<BubbleBreadcrumbSearchProps> = {}) =>
  render(
    <BubbleToolbar position="static">
      <BubbleBreadcrumbSearch
        items={[{ label: 'Projects', href: '/projects' }, { label: 'Docs' }, { label: 'Themes' }]}
        onSearch={() => Promise.resolve([])}
        onSelect={jest.fn()}
        {...props}
      />
    </BubbleToolbar>,
  );

describe('BubbleBreadcrumbSearch', () => {
  it('shows the breadcrumb while closed and marks the current page', () => {
    renderBreadcrumb();
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveTextContent('Projects / Docs / Themes');
    expect(nav).toHaveAttribute('title', 'Projects / Docs / Themes');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    expect(screen.getByText('Themes')).toHaveAttribute('aria-current', 'page');
    expect(nav.querySelector('.bubble-breadcrumb__current')).toHaveTextContent(/^Themes$/);
    expect(screen.getByRole('group')).toHaveAttribute('data-compact', 'false');
  });

  it('swaps the breadcrumb for the combobox when opened', () => {
    renderBreadcrumb({ labels: { location: 'Current page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.getByRole('navigation', { name: 'Current page' })).toBeInTheDocument();
  });

  it('uses a custom separator and renders a single level', () => {
    renderBreadcrumb({ items: [{ label: 'Home' }], separator: '›' });
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent(/^Home$/);
    expect(nav.querySelector('.bubble-breadcrumb__parents')).toBeNull();
  });

  it('writes breadcrumb tokens next to search tokens', () => {
    renderBreadcrumb({
      tokens: { breadcrumbSeparatorColor: 'gray', breadcrumbCurrentWeight: 700, width: '30rem' },
    });
    const group = screen.getByRole('group');
    expect(group.style.getPropertyValue('--bubble-breadcrumb-separator-color')).toBe('gray');
    expect(group.style.getPropertyValue('--bubble-breadcrumb-current-weight')).toBe('700');
    expect(group.style.getPropertyValue('--bubble-search-width')).toBe('30rem');
  });
});
