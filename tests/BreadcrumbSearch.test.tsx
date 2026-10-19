import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { BreadcrumbSearchDemo } from '../stories/examples/BreadcrumbSearchDemo';

const openSearch = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Search pages' }));
  return screen.getByRole('combobox', { name: 'Search project pages' });
};
const finishSearch = async (milliseconds = 400) => {
  await act(async () => {
    jest.advanceTimersByTime(milliseconds);
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

it('starts with five groups and only opens search when its button is pressed', () => {
  render(<BreadcrumbSearchDemo />);
  expect(screen.getAllByRole('group')).toHaveLength(5);
  expect(screen.getByRole('navigation', { name: 'Current page' })).toHaveTextContent(
    'Projects / Bubble Toolbar / Overview',
  );
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('navigation'));
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  const input = openSearch();
  expect(input).toHaveFocus();
  expect(input).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Suggested pages');
  expect(screen.getAllByRole('option')).toHaveLength(3);
  expect(screen.getByRole('group', { name: 'Page search' })).toHaveAttribute(
    'data-expanded',
    'true',
  );
});

it('filters titles and paths asynchronously, with activity isolated to the second group', async () => {
  render(<BreadcrumbSearchDemo />);
  const input = openSearch();
  fireEvent.change(input, { target: { value: 'DESIGN' } });
  const searchGroup = screen.getByRole('group', { name: 'Page search' });
  expect(searchGroup).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Searching…');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();
  for (const group of screen.getAllByRole('group').filter((group) => group !== searchGroup)) {
    expect(group).toHaveAttribute('aria-busy', 'false');
  }
  await finishSearch();
  expect(searchGroup).toHaveAttribute('aria-busy', 'false');
  expect(screen.getByRole('option')).toHaveTextContent('Themes');
  fireEvent.change(input, { target: { value: ' design ' } });
  expect(screen.getByRole('option')).toHaveTextContent('Themes');
  expect(searchGroup).toHaveAttribute('aria-busy', 'false');
});

it('shows help and selectable suggestions when nothing matches', async () => {
  render(<BreadcrumbSearchDemo />);
  const input = openSearch();
  fireEvent.change(input, { target: { value: 'not-a-page' } });
  await finishSearch();
  expect(screen.getByRole('status')).toHaveTextContent('No results');
  expect(screen.getAllByRole('option')).toHaveLength(3);
  fireEvent.change(input, { target: { value: ' ' } });
  expect(screen.getByRole('status')).toHaveTextContent('Suggested pages');
});

it('cancels previous queries so stale results cannot replace newer matches', async () => {
  render(
    <StrictMode>
      <BreadcrumbSearchDemo />
    </StrictMode>,
  );
  const input = openSearch();
  fireEvent.change(input, { target: { value: 'themes' } });
  await finishSearch(300);
  fireEvent.change(input, { target: { value: 'settings' } });
  await finishSearch(100);
  expect(screen.getByRole('status')).toHaveTextContent('Searching…');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();
  await finishSearch(300);
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option')).toHaveTextContent('Project settings');
  expect(screen.getByRole('group', { name: 'Page search' })).toHaveAttribute('aria-busy', 'false');
});

it('supports arrows and Enter, updating the breadcrumb and restoring button focus', () => {
  render(<BreadcrumbSearchDemo />);
  const input = openSearch();
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  const [, , lastSuggestion] = screen.getAllByRole('option');
  expect(lastSuggestion).toHaveAttribute('aria-selected', 'true');
  expect(input).toHaveAttribute('aria-activedescendant', lastSuggestion.id);
  expect(input).toHaveFocus();
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.getByRole('navigation')).toHaveTextContent(
    'Projects / Bubble Toolbar / Components',
  );
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Search pages' })).toHaveFocus();
});

it('allows pointer selection without prematurely closing on pointerdown', () => {
  render(<BreadcrumbSearchDemo />);
  const input = openSearch();
  const option = screen.getByRole('option', { name: /Async activity/ });
  expect(fireEvent.pointerDown(option)).toBe(false);
  expect(input).toHaveFocus();
  fireEvent.click(option);
  expect(screen.getByRole('navigation')).toHaveTextContent('Guides / Async activity');
  expect(screen.getByRole('button', { name: 'Search pages' })).toHaveFocus();
});

it('Escape cancels work, clears the query, and restores focus without changing the breadcrumb', async () => {
  render(<BreadcrumbSearchDemo />);
  const input = openSearch();
  fireEvent.change(input, { target: { value: 'themes' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  await finishSearch();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByRole('navigation')).toHaveTextContent('Overview');
  expect(screen.getByRole('button', { name: 'Search pages' })).toHaveFocus();
  expect(screen.getByRole('group', { name: 'Page search' })).toHaveAttribute('aria-busy', 'false');
  expect(openSearch()).toHaveValue('');
  expect(screen.getByRole('status')).toHaveTextContent('Suggested pages');
});

it('outside pointer interaction closes without stealing focus from its destination', () => {
  render(<BreadcrumbSearchDemo />);
  openSearch();
  const outside = screen.getByRole('button', { name: 'Continue working' });
  fireEvent.pointerDown(outside);
  act(() => {
    outside.focus();
  });
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(outside).toHaveFocus();
});

it('keeps search open during internal focus moves and closes on tabbing out', () => {
  render(<BreadcrumbSearchDemo />);
  const input = openSearch();
  const button = screen.getByRole('button', { name: 'Search pages' });
  act(() => {
    button.focus();
  });
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  act(() => {
    input.focus();
  });
  const nextGroupButton = screen.getByRole('button', { name: 'Change theme' });
  act(() => {
    nextGroupButton.focus();
  });
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(nextGroupButton).toHaveFocus();
  expect(
    within(screen.getByRole('group', { name: 'Page search' })).getByRole('navigation'),
  ).toHaveTextContent('Overview');
});

it('cleans up a pending mock search on unmount', async () => {
  const { unmount } = render(<BreadcrumbSearchDemo />);
  fireEvent.change(openSearch(), { target: { value: 'themes' } });
  expect(jest.getTimerCount()).toBe(1);
  unmount();
  expect(jest.getTimerCount()).toBe(0);
  await finishSearch();
});
