import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createRef, StrictMode } from 'react';
import { BubbleGroup, BubbleIconButton, BubbleToolbar, useBubbleActivity } from '../src';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const GroupWrapper = ({ children }: { children: ReactNode }) => (
  <StrictMode>
    <BubbleGroup>{children}</BubbleGroup>
  </StrictMode>
);

describe('bubble activity', () => {
  it('combines toolbar and group busy flags without changing DOM refs or shape', () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(
      <BubbleToolbar busy>
        <BubbleToolbar.Group ref={ref} busy={false}>
          <span>One</span>
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <span>Two</span>
          <span>Three</span>
        </BubbleToolbar.Group>
      </BubbleToolbar>,
    );
    const [circle, pill] = screen.getAllByRole('group');
    expect(ref.current).toBe(circle);
    expect(circle).toHaveAttribute('data-shape', 'circle');
    expect(pill).toHaveAttribute('data-shape', 'pill');
    for (const group of [circle, pill]) {
      expect(group).toHaveAttribute('aria-busy', 'true');
      expect(group).toHaveClass('bubble-group--busy');
    }
    rerender(
      <BubbleToolbar busy={false}>
        <BubbleToolbar.Group busy>
          <span>One</span>
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <span>Two</span>
          <span>Three</span>
        </BubbleToolbar.Group>
      </BubbleToolbar>,
    );
    expect(circle).toHaveAttribute('aria-busy', 'true');
    expect(pill).toHaveAttribute('aria-busy', 'false');
    expect(pill).not.toHaveClass('bubble-group--busy');
  });

  it('keeps concurrent tasks active until the last settles and returns their values', async () => {
    const { result } = renderHook(useBubbleActivity, { wrapper: GroupWrapper });
    const first = deferred<string>();
    const second = deferred<number>();
    let firstRun!: Promise<string>;
    let secondRun!: Promise<number>;
    act(() => {
      firstRun = result.current.run(() => first.promise);
      secondRun = result.current.run(() => second.promise);
    });
    expect(result.current.isBusy).toBe(true);
    await act(async () => {
      second.resolve(42);
      expect(await secondRun).toBe(42);
    });
    expect(result.current.isBusy).toBe(true);
    await act(async () => {
      first.resolve('saved');
      expect(await firstRun).toBe('saved');
    });
    expect(result.current.isBusy).toBe(false);
  });

  it('propagates rejected promises and synchronous exceptions and clears activity', async () => {
    const { result } = renderHook(useBubbleActivity, { wrapper: GroupWrapper });
    const failure = new Error('Could not save');
    const task = deferred<void>();
    let run!: Promise<void>;
    act(() => {
      run = result.current.run(() => task.promise);
    });
    expect(result.current.isBusy).toBe(true);
    await act(async () => {
      const rejection = expect(run).rejects.toBe(failure);
      task.reject(failure);
      await rejection;
    });
    expect(result.current.isBusy).toBe(false);
    await act(async () => {
      await expect(
        result.current.run(() => {
          throw failure;
        }),
      ).rejects.toBe(failure);
    });
    expect(result.current.isBusy).toBe(false);
  });

  it('keeps pending tasks visible when external busy becomes false', async () => {
    let busy = true;
    const { result, rerender } = renderHook(useBubbleActivity, {
      wrapper: ({ children }: { children?: ReactNode }) => (
        <BubbleToolbar busy={busy}>
          <BubbleGroup busy={false}>{children}</BubbleGroup>
        </BubbleToolbar>
      ),
    });
    const task = deferred<void>();
    let run!: Promise<void>;
    act(() => {
      run = result.current.run(() => task.promise);
    });
    busy = false;
    rerender();
    expect(result.current.isBusy).toBe(true);
    await act(async () => {
      task.resolve();
      await run;
    });
    expect(result.current.isBusy).toBe(false);
  });

  it('does not cancel the consumer promise on unmount', async () => {
    const { result, unmount } = renderHook(useBubbleActivity, { wrapper: GroupWrapper });
    const task = deferred<string>();
    let run!: Promise<string>;
    act(() => {
      run = result.current.run(() => task.promise);
    });
    unmount();
    task.resolve('finished after unmount');
    await expect(run).resolves.toBe('finished after unmount');
  });

  it('isolates tasks in array-created groups and keeps buttons interactive', async () => {
    const task = deferred<void>();
    const Action = () => {
      const { run, isBusy } = useBubbleActivity();
      return (
        <BubbleIconButton
          ariaLabel={isBusy ? 'Working' : 'Save'}
          onClick={() => {
            void run(() => task.promise);
          }}
        />
      );
    };
    render(<BubbleToolbar groups={[[<Action key="action" />], [<span key="idle">Idle</span>]]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    const [working, idle] = screen.getAllByRole('group');
    expect(working).toHaveAttribute('aria-busy', 'true');
    expect(idle).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('button', { name: 'Working' })).toBeEnabled();
    await act(async () => {
      task.resolve();
      await task.promise;
    });
    expect(working).toHaveAttribute('aria-busy', 'false');
  });

  it('inherits appearance and lets individual groups override it', () => {
    render(
      <BubbleToolbar busy activityColors={['red', 'green', 'blue']} activityDuration={4}>
        <BubbleToolbar.Group>
          <span>Inherited</span>
        </BubbleToolbar.Group>
        <BubbleToolbar.Group activityColors={['cyan', 'pink', 'gold']} activityDuration={1}>
          <span>Custom</span>
        </BubbleToolbar.Group>
      </BubbleToolbar>,
    );
    const [inherited, custom] = screen.getAllByRole('group');
    expect(inherited.style.getPropertyValue('--bubble-activity-color-1')).toBe('red');
    expect(inherited.style.getPropertyValue('--bubble-activity-duration')).toBe('4s');
    expect(custom.style.getPropertyValue('--bubble-activity-color-1')).toBe('cyan');
    expect(custom.style.getPropertyValue('--bubble-activity-duration')).toBe('1s');
    expect(inherited).not.toHaveAttribute('busy');
    expect(screen.getByRole('toolbar')).not.toHaveAttribute('activityDuration');
  });

  it('explains missing group context', () => {
    const Consumer = () => {
      useBubbleActivity();
      return null;
    };
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Consumer />)).toThrow(
        'useBubbleActivity must be used inside a BubbleGroup',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
