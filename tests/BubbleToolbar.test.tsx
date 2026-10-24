import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { BubbleToolbar } from '../src/BubbleToolbar';
import { BubbleArea } from '../src/components/BubbleArea';
import { BubbleIconButton } from '../src/components/BubbleIconButton';
import { getGlassStyles } from '../src/utils/styles';

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
          [
            <BubbleIconButton key="search" name="search" />,
            <BubbleArea key="area">Search...</BubbleArea>,
          ],
          [<BubbleIconButton key="theme" name="theme" />],
          [<BubbleIconButton key="chat" name="chat" />],
          [<BubbleIconButton key="notif" name="notifications" />],
        ]}
      />,
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
          <button type="button">Action 1</button>
          <button type="button">Action 2</button>
        </BubbleToolbar.Group>
      </BubbleToolbar>,
    );

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute('data-shape', 'circle');
    expect(groups[1]).toHaveAttribute('data-shape', 'pill');
  });

  it('applies floating bottom positioning styles by default', () => {
    render(<BubbleToolbar groups={[[<span key="1">Item</span>]]} />);

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.style.position).toBe('fixed');
    expect(toolbar.style.bottom).toBe('-4px');
    expect(parseFloat(toolbar.style.bottom) + parseFloat(toolbar.style.padding)).toBe(28);
    expect(toolbar.style.left).toBe('50%');
    expect(toolbar.style.transform).toBe('translateX(-50%)');
    expect(toolbar.style.zIndex).toBe('1000');
  });

  it('supports top positioning', () => {
    render(<BubbleToolbar position="top" groups={[[<span key="1">Item</span>]]} />);

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.style.position).toBe('fixed');
    expect(toolbar.style.top).toBe('-4px');
    expect(parseFloat(toolbar.style.top) + parseFloat(toolbar.style.padding)).toBe(28);
    expect(toolbar.style.bottom).toBe('');
  });

  it('supports static positioning', () => {
    render(<BubbleToolbar position="static" groups={[[<span key="1">Item</span>]]} />);

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
      />,
    );

    const group = screen.getByRole('group');
    // Backdrop filter applies blur
    expect(group.style.backdropFilter).toContain('blur(20px)');
    // jsdom drops var() in shorthand/color properties, so assert the generated value.
    expect(getGlassStyles('glass', true, 20, true, true).border).toBe(
      '1px solid var(--bubble-glass-border, rgba(255, 255, 255, 0.4))',
    );
  });

  it('supports dark theme', () => {
    render(<BubbleToolbar theme="dark" groups={[[<span key="1">Item</span>]]} />);

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(getGlassStyles('dark', true, 16, true, true)).toMatchObject({
      backgroundColor: 'var(--bubble-dark-bg, rgba(24, 24, 27, 0.72))',
      color: 'var(--bubble-dark-fg, #f4f4f5)',
    });
  });

  it('keeps original values as token fallbacks for every theme', () => {
    expect(getGlassStyles('glass', false, 16, true, true)).toMatchObject({
      backgroundColor: 'var(--bubble-glass-bg-solid, rgba(255, 255, 255, 0.92))',
      color: 'var(--bubble-glass-fg, #09090b)',
      boxShadow:
        'var(--bubble-glass-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06))',
    });
    expect(getGlassStyles('light', true, 16, true, true)).toMatchObject({
      backgroundColor: 'var(--bubble-light-bg, rgba(255, 255, 255, 0.75))',
      border: '1px solid var(--bubble-light-border, rgba(0, 0, 0, 0.08))',
    });
    expect(getGlassStyles('auto', true, 16, true, true).color).toBe(
      'var(--bubble-fg, var(--bubble-light-fg, #18181b))',
    );
  });

  it('uses the --bubble-blur token when blurAmount is omitted', () => {
    expect(getGlassStyles('glass', true, undefined, true, true).backdropFilter).toBe(
      'blur(var(--bubble-blur, 16px)) saturate(180%)',
    );
  });

  it('accepts CSS lengths and clamps negative blur amounts', () => {
    expect(getGlassStyles('glass', true, '1rem', true, true).backdropFilter).toBe(
      'blur(1rem) saturate(180%)',
    );
    expect(getGlassStyles('glass', true, -4, true, true).backdropFilter).toBe(
      'blur(0px) saturate(180%)',
    );
  });

  it('uses a solid background for the auto theme when blur is off', () => {
    expect(getGlassStyles('auto', false, 16, true, true).backgroundColor).toBe(
      'var(--bubble-bg-solid, var(--bubble-light-bg-solid, rgba(255, 255, 255, 0.95)))',
    );
  });

  it('does not transition backdrop-filter', () => {
    const styles = getGlassStyles('glass', true, 16, true, true);
    expect(styles.transition).toBeUndefined();
    expect(styles.transitionProperty).not.toContain('backdrop-filter');
  });

  it('forwards ref to the toolbar container element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<BubbleToolbar ref={ref} groups={[[<span key="1">Item</span>]]} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'toolbar');
  });

  it('supports custom positioning and custom size sm and lg', () => {
    const { rerender } = render(
      <BubbleToolbar position="custom" size="sm" groups={[[<span key="1">Small</span>]]} />,
    );

    let group = screen.getByRole('group');
    expect(group.style.height).toBe('40px');

    rerender(
      <BubbleToolbar
        size="lg"
        theme="auto"
        shadow="0 4px 12px rgba(0,0,0,0.2)"
        groups={[[<span key="1">Large</span>]]}
      />,
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
      />,
    );

    const group = screen.getByRole('group');
    expect(group.style.boxShadow).toBe('none');
    expect(group.style.border).toBe('');
    expect(group.style.backdropFilter).toBe('');
  });
});
