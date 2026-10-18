import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BubbleIconButton } from '../src/components/BubbleIconButton';
import { BubbleArea } from '../src/components/BubbleArea';

describe('BubbleIconButton', () => {
  it('renders standard icon by name and handles click', () => {
    const handleClick = jest.fn();
    render(<BubbleIconButton name="search" onClick={handleClick} />);

    const btn = screen.getByRole('button', { name: /search button/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom icon and tooltip', () => {
    render(
      <BubbleIconButton
        icon={<span data-testid="custom-svg">SVG</span>}
        tooltip="Custom Tooltip"
      />
    );

    const btn = screen.getByRole('button', { name: /custom tooltip/i });
    expect(btn).toHaveAttribute('title', 'Custom Tooltip');
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('renders badge indicator when provided', () => {
    render(<BubbleIconButton name="notifications" badge={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies active class and style', () => {
    render(<BubbleIconButton name="chat" active={true} />);

    const btn = screen.getByRole('button', { name: /chat button/i });
    expect(btn.className).toContain('bubble-icon-button--active');
  });

  it('calls onMouseEnter and onMouseLeave props when provided', () => {
    const handleEnter = jest.fn();
    const handleLeave = jest.fn();

    render(
      <BubbleIconButton
        name="search"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      />
    );

    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    expect(handleEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(btn);
    expect(handleLeave).toHaveBeenCalledTimes(1);
  });
});

describe('BubbleArea', () => {
  it('renders children with flexible area layout and maxWidth', () => {
    render(
      <BubbleArea minWidth={150} maxWidth={300}>
        <input placeholder="Type something..." />
      </BubbleArea>
    );

    const input = screen.getByPlaceholderText('Type something...');
    expect(input).toBeInTheDocument();
    expect(input.parentElement?.style.minWidth).toBe('150px');
    expect(input.parentElement?.style.maxWidth).toBe('300px');
  });

  it('forwards ref to div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BubbleArea ref={ref}>
        <span>Area Content</span>
      </BubbleArea>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
