import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { BubbleToolbar } from '../src/BubbleToolbar';
import { BubbleIconButton } from '../src/components/BubbleIconButton';
import { BubbleArea } from '../src/components/BubbleArea';

describe('BubbleToolbar', () => {
  it('renders groups array structure exactly matching user specification', () => {
    // Exactly matches the example given by the user:
    // [<Logo />]
    // [<IconButton name="search">, <ToolbarArea />], [<IconButton name="theme" />], [<IconButton name="chat" />], [<IconButton name="notifications" />]
    const Logo = () => <span data-testid="app-logo">Logo</span>;

    render(
      <BubbleToolbar
        groups={[
          [<Logo key="logo" />],
          [<BubbleIconButton key="search" name="search" />, <BubbleArea key="area">Search...</BubbleArea>],
          [<BubbleIconButton key="theme" name="theme" />],
          [<BubbleIconButton key="chat" name="chat" />],
          [<BubbleIconButton key="notif" name="notifications" />],
        ]}
      />
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(5);

    // Group 0: [<Logo />] => 1 node => circle
    expect(groups[0]).toHaveAttribute('data-shape', 'circle');
    expect(groups[0]).toHaveAttribute('data-items-count', '1');
    expect(groups[0].className).toContain('bubble-group--circle');
    expect(screen.getByTestId('app-logo')).toBeInTheDocument();

    // Group 1: [<IconButton name="search">, <ToolbarArea />] => 2 nodes => pill
    expect(groups[1]).toHaveAttribute('data-shape', 'pill');
    expect(groups[1]).toHaveAttribute('data-items-count', '2');
    expect(groups[1].className).toContain('bubble-group--pill');
    expect(screen.getByText('Search...')).toBeInTheDocument();

    // Group 2: [<IconButton name="theme" />] => 1 node => circle
    expect(groups[2]).toHaveAttribute('data-shape', 'circle');
    expect(groups[2]).toHaveAttribute('data-items-count', '1');

    // Group 3: [<IconButton name="chat" />] => 1 node => circle
    expect(groups[3]).toHaveAttribute('data-shape', 'circle');
    expect(groups[3]).toHaveAttribute('data-items-count', '1');

    // Group 4: [<IconButton name="notifications" />] => 1 node => circle
    expect(groups[4]).toHaveAttribute('data-shape', 'circle');
    expect(groups[4]).toHaveAttribute('data-items-count', '1');
  });

  it('renders correctly with compound syntax BubbleToolbar.Group', () => {
    render(
      <BubbleToolbar>
        <BubbleToolbar.Group>
          <span>Logo</span>
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <button>Action 1</button>
          <button>Action 2</button>
        </BubbleToolbar.Group>
      </BubbleToolbar>
    );

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute('data-shape', 'circle');
    expect(groups[1]).toHaveAttribute('data-shape', 'pill');
  });

  it('applies floating bottom positioning styles by default', () => {
    render(
      <BubbleToolbar groups={[[<span key="1">Item</span>]]} />
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.style.position).toBe('fixed');
    expect(toolbar.style.bottom).toBe('24px');
    expect(toolbar.style.left).toBe('50%');
    expect(toolbar.style.transform).toBe('translateX(-50%)');
    expect(toolbar.style.zIndex).toBe('1000');
  });

  it('supports top positioning', () => {
    render(
      <BubbleToolbar position="top" groups={[[<span key="1">Item</span>]]} />
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.style.position).toBe('fixed');
    expect(toolbar.style.top).toBe('24px');
    expect(toolbar.style.bottom).toBe('');
  });

  it('supports static positioning', () => {
    render(
      <BubbleToolbar position="static" groups={[[<span key="1">Item</span>]]} />
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.style.position).toBe('relative');
  });

  it('applies blurred glassmorphic styles', () => {
    render(
      <BubbleToolbar
        theme="glass"
        blurred={true}
        blurAmount={20}
        groups={[[<span key="1">Item</span>]]}
      />
    );

    const group = screen.getByRole('group');
    // Backdrop filter applies blur
    expect(group.style.backdropFilter).toContain('blur(20px)');
    expect(group.style.border).toContain('1px solid');
  });

  it('supports dark theme', () => {
    render(
      <BubbleToolbar
        theme="dark"
        groups={[[<span key="1">Item</span>]]}
      />
    );

    const group = screen.getByRole('group');
    expect(group.style.color).toBe('rgb(244, 244, 245)');
  });

  it('forwards ref to the toolbar container element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BubbleToolbar ref={ref} groups={[[<span key="1">Item</span>]]} />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'toolbar');
  });

  it('supports custom positioning and custom size sm and lg', () => {
    const { rerender } = render(
      <BubbleToolbar position="custom" size="sm" groups={[[<span key="1">Small</span>]]} />
    );

    let group = screen.getByRole('group');
    expect(group.style.height).toBe('40px');

    rerender(
      <BubbleToolbar size="lg" theme="auto" shadow="0 4px 12px rgba(0,0,0,0.2)" groups={[[<span key="1">Large</span>]]} />
    );

    group = screen.getByRole('group');
    expect(group.style.height).toBe('56px');
    expect(group.style.boxShadow).toBe('0 4px 12px rgba(0,0,0,0.2)');
  });

  it('supports shadow set to false and light theme', () => {
    render(
      <BubbleToolbar
        theme="light"
        shadow={false}
        blurred={false}
        bordered={false}
        groups={[[<span key="1">Plain</span>]]}
      />
    );

    const group = screen.getByRole('group');
    expect(group.style.boxShadow).toBe('none');
    expect(group.style.border).toBe('');
    expect(group.style.backdropFilter).toBe('');
  });
});
