import { render, screen } from '@testing-library/react';
import { createRef, Fragment } from 'react';
import { BubbleGroup } from '../src/BubbleGroup';
import { BubbleToolbarContext, defaultContextValue } from '../src/context';

describe('BubbleGroup', () => {
  it('renders as a circle when it has exactly 1 valid child', () => {
    render(
      <BubbleGroup>
        <span data-testid="single-item">Logo</span>
      </BubbleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('data-shape', 'circle');
    expect(group).toHaveAttribute('data-items-count', '1');
    expect(group.className).toContain('bubble-group--circle');
    expect(screen.getByTestId('single-item')).toBeInTheDocument();

    // Check circular dimensions (equal width and height)
    expect(group.style.width).toBe('48px');
    expect(group.style.height).toBe('48px');
    expect(group.style.borderRadius).toBe('9999px');
  });

  it('renders as a pill / rounded rectangle when it has more than 1 child', () => {
    render(
      <BubbleGroup>
        <button type="button" data-testid="search-btn">
          Search
        </button>
        <span data-testid="area">ToolbarArea</span>
      </BubbleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-shape', 'pill');
    expect(group).toHaveAttribute('data-items-count', '2');
    expect(group.className).toContain('bubble-group--pill');
    expect(screen.getByTestId('search-btn')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();

    // Height matches circle height, width is auto, borderRadius is rounded-full
    expect(group.style.height).toBe('48px');
    expect(group.style.width).toBe('auto');
    expect(group.style.borderRadius).toBe('9999px');
  });

  it('filters out null, undefined, boolean and empty fragments when determining shape', () => {
    render(
      <BubbleGroup>
        {null}
        <span data-testid="valid-item">Only One</span>
        {false}
        {undefined}
      </BubbleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-shape', 'circle');
    expect(group).toHaveAttribute('data-items-count', '1');
  });

  it('unpacks React.Fragment children correctly', () => {
    render(
      <BubbleGroup>
        <Fragment key="items">
          <span>Item 1</span>
          <span>Item 2</span>
        </Fragment>
      </BubbleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-shape', 'pill');
    expect(group).toHaveAttribute('data-items-count', '2');
  });

  it('allows overriding shape via shape prop', () => {
    render(
      <BubbleGroup shape="pill">
        <span>Single Item Forced Pill</span>
      </BubbleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-shape', 'pill');
    expect(group.className).toContain('bubble-group--pill');
  });

  it('forwards ref to the underlying HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BubbleGroup ref={ref}>
        <span>Item</span>
      </BubbleGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-shape', 'circle');
  });

  it('respects size from context or prop', () => {
    render(
      <BubbleToolbarContext.Provider value={{ ...defaultContextValue, size: 'lg' }}>
        <BubbleGroup>
          <span>Large Item</span>
        </BubbleGroup>
      </BubbleToolbarContext.Provider>,
    );

    const group = screen.getByRole('group');
    // lg size is 56px
    expect(group.style.height).toBe('56px');
    expect(group.style.width).toBe('56px');
  });

  it('supports custom numeric size and custom style / className', () => {
    render(
      <BubbleGroup size={60} className="custom-bubble" style={{ opacity: 0.8 }}>
        <span>Custom</span>
      </BubbleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group.style.height).toBe('60px');
    expect(group.style.width).toBe('60px');
    expect(group.style.opacity).toBe('0.8');
    expect(group.className).toContain('custom-bubble');
  });
});
