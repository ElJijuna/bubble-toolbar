import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { BubbleLiveActivityController } from '../src';
import {
  BubbleIconButton,
  BubbleToolbar,
  useBubbleLiveActivity,
  useBubbleToolbarLiveActivity,
} from '../src';
import { createLiveController } from '../src/live/controller';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const advance = (ms: number) =>
  act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('Live Activity controller', () => {
  const connected = (options = {}) => {
    const controller = createLiveController(options);
    controller.connect();
    return controller;
  };

  it('goes idle → compact → expanded → idle, keeping compact for minPendingMs', async () => {
    const live = connected();
    const task = deferred<number>();
    const result = live.run(() => task.promise, {
      success: (value) => ({ title: `Got ${value}` }),
      duration: 1000,
    });
    expect(live.state).toBe('compact');
    task.resolve(7);
    await expect(result).resolves.toBe(7);
    await advance(599);
    expect(live.state).toBe('compact');
    await advance(1);
    expect(live.getSnapshot()).toMatchObject({
      state: 'expanded',
      outcome: 'success',
      content: { title: 'Got 7' },
    });
    await advance(1000);
    expect(live.state).toBe('idle');
  });

  it('rethrows the original error to the caller and shows the error card', async () => {
    const live = connected({ minPendingMs: 0 });
    const error = new Error('nope');
    const result = live.run(() => Promise.reject(error));
    await expect(result).rejects.toBe(error);
    await advance(0);
    expect(live.getSnapshot()).toMatchObject({ state: 'expanded', outcome: 'error' });
  });

  it('turns synchronous throws into rejections', async () => {
    const live = connected();
    const error = new Error('sync');
    await expect(
      live.run(() => {
        throw error;
      }),
    ).rejects.toBe(error);
  });

  it('keeps duration 0 cards until dismissed', async () => {
    const live = connected();
    live.show({ title: 'Sticky' }, { duration: 0 });
    await advance(60_000);
    expect(live.state).toBe('expanded');
    live.dismiss();
    expect(live.state).toBe('idle');
  });

  it('shows queued activities in FIFO order and dismiss moves to the next', async () => {
    const live = connected({ minPendingMs: 0, duration: 500 });
    const first = deferred<string>();
    void live.run(() => first.promise, { success: (value) => ({ title: value }) });
    void live.run(() => Promise.resolve('second'), { success: (value) => ({ title: value }) });
    live.show({ title: 'third' });
    expect(live.getSnapshot()).toMatchObject({ state: 'compact', queued: 2 });
    first.resolve('first');
    await advance(0);
    expect(live.getSnapshot()).toMatchObject({ content: { title: 'first' }, queued: 2 });
    live.dismiss();
    // The second task already settled, so it goes straight to its card.
    expect(live.getSnapshot()).toMatchObject({
      state: 'expanded',
      content: { title: 'second' },
      queued: 1,
    });
    await advance(500);
    expect(live.getSnapshot()).toMatchObject({ content: { title: 'third' }, queued: 0 });
    await advance(500);
    expect(live.state).toBe('idle');
  });

  it('pauses and resumes the remaining time', async () => {
    const live = connected({ duration: 1000 });
    live.show({ title: 'Paused' });
    await advance(400);
    live.pause();
    await advance(5000);
    expect(live.getSnapshot()).toMatchObject({ state: 'expanded', paused: true });
    live.resume();
    await advance(599);
    expect(live.state).toBe('expanded');
    await advance(1);
    expect(live.state).toBe('idle');
  });

  it('still runs the task without a toolbar and warns once', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const live = createLiveController();
    await expect(live.run(() => 1)).resolves.toBe(1);
    await expect(live.run(() => 2)).resolves.toBe(2);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('BubbleToolbar liveActivity', () => {
  let controller: BubbleLiveActivityController;

  const Counter = () => {
    const [count, setCount] = useState(0);
    return <BubbleIconButton ariaLabel={`Count ${count}`} onClick={() => setCount((c) => c + 1)} />;
  };

  const Launcher = () => {
    const live = useBubbleToolbarLiveActivity();
    return (
      <BubbleIconButton
        ariaLabel="Launch"
        onClick={() => void live.show({ title: 'From inside' }, { duration: 0 })}
      />
    );
  };

  const App = ({ position }: { position?: 'top' | 'bottom' }) => {
    controller = useBubbleLiveActivity({
      duration: 2000,
      minPendingMs: 0,
      labels: { close: 'Close' },
      tokens: { width: 400, successColor: 'lime' },
    });
    return (
      <BubbleToolbar position={position} liveActivity={controller}>
        <BubbleToolbar.Group>
          <Counter />
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <Launcher />
        </BubbleToolbar.Group>
      </BubbleToolbar>
    );
  };

  const liveGroup = () => screen.queryByRole('group', { name: 'Live activity' });
  const groupsWrapper = () =>
    screen.getByRole('button', { name: /Count/, hidden: true }).closest('.bubble-group')
      ?.parentElement as HTMLElement;

  it('collapses the groups into one pill, shows the card and restores them with their state', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Count 0' }));
    const task = deferred<string>();
    let result: Promise<string> | undefined;
    act(() => {
      result = controller.run(() => task.promise, {
        pending: { title: 'Uploading…' },
        success: (name) => ({ title: 'Uploaded', description: name }),
      });
    });
    expect(liveGroup()).toHaveAttribute('data-state', 'compact');
    expect(liveGroup()).toHaveAttribute('aria-busy', 'true');
    expect(groupsWrapper().inert).toBe(true);
    expect(groupsWrapper().style.display).toBe('none');
    expect(screen.getByRole('status')).toHaveTextContent('Uploading…');

    await act(async () => {
      task.resolve('report.pdf');
      await result;
    });
    await advance(50);
    expect(liveGroup()).toHaveAttribute('data-state', 'expanded');
    expect(liveGroup()).toHaveAttribute('data-tone', 'success');
    expect(liveGroup()).toHaveTextContent('Uploaded');
    expect(liveGroup()).toHaveTextContent('report.pdf');
    expect(screen.getByRole('status')).toHaveTextContent('Uploaded. report.pdf');

    await advance(2000);
    await advance(700);
    expect(liveGroup()).not.toBeInTheDocument();
    expect(groupsWrapper().inert).toBe(false);
    expect(screen.getByRole('button', { name: 'Count 1' })).toBeInTheDocument();
  });

  it('closes with the X button and with Escape', async () => {
    render(<App />);
    act(() => controller.show({ title: 'One' }));
    act(() => controller.show({ title: 'Two' }));
    await advance(50);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(liveGroup()).toHaveTextContent('Two');
    fireEvent.keyDown(liveGroup() as HTMLElement, { key: 'Escape' });
    expect(controller.state).toBe('idle');
    await advance(700);
    expect(liveGroup()).not.toBeInTheDocument();
  });

  it('pauses the timer while hovered or focused', async () => {
    render(<App />);
    act(() => controller.show({ title: 'Read me' }));
    await advance(50);
    fireEvent.mouseEnter(liveGroup() as HTMLElement);
    await advance(10_000);
    expect(controller.state).toBe('expanded');
    expect(
      liveGroup()?.querySelector<HTMLElement>('.bubble-live__progress')?.style.animationPlayState,
    ).toBe('paused');
    fireEvent.mouseLeave(liveGroup() as HTMLElement);
    await advance(2000);
    expect(controller.state).toBe('idle');
  });

  it('announces errors through an alert and uses the error tone', async () => {
    render(<App />);
    act(() => {
      void (async () => {
        try {
          await controller.run(() => Promise.reject(new Error('x')));
        } catch {
          // The caller receives the rejection; the card shows the error.
        }
      })();
    });
    await advance(50);
    expect(liveGroup()).toHaveAttribute('data-tone', 'error');
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('moves focus into the pill and restores it to the original element', async () => {
    render(<App />);
    const launch = screen.getByRole('button', { name: 'Launch' });
    act(() => launch.focus());
    fireEvent.click(launch);
    await advance(50);
    expect(liveGroup()).toContainElement(document.activeElement as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await advance(700);
    expect(screen.getByRole('button', { name: 'Launch' })).toHaveFocus();
  });

  it('writes live tokens as CSS custom properties', async () => {
    render(<App />);
    act(() => controller.show({ title: 'Tokens' }));
    expect(liveGroup()?.style.getPropertyValue('--bubble-live-width')).toBe('400px');
    expect(liveGroup()?.style.getPropertyValue('--bubble-live-success-color')).toBe('lime');
  });

  it('skips the morph with prefers-reduced-motion', async () => {
    const { matchMedia } = window;
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    render(<App />);
    act(() => controller.show({ title: 'Instant' }));
    expect(liveGroup()).toHaveAttribute('data-state', 'expanded');
    act(() => controller.dismiss());
    expect(liveGroup()).not.toBeInTheDocument();
    window.matchMedia = matchMedia;
  });

  it('renders no extra DOM when liveActivity is not used', () => {
    render(
      <BubbleToolbar>
        <BubbleToolbar.Group>
          <span>Item</span>
        </BubbleToolbar.Group>
      </BubbleToolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.children).toHaveLength(1);
    expect(toolbar.firstElementChild).toHaveClass('bubble-group');
  });
});
