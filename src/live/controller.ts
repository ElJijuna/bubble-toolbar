import type {
  BubbleLiveActivityController,
  BubbleLiveActivityOptions,
  BubbleLiveContent,
  BubbleLiveRunOptions,
  BubbleLiveState,
} from '../types';

export type LiveOutcome = 'pending' | 'success' | 'error' | 'neutral';

export interface LiveSnapshot {
  state: BubbleLiveState;
  /** Increments for every activity shown, so the UI can restart animations. */
  id: number;
  /** Explicit content; undefined means "use the label for this outcome". */
  content?: BubbleLiveContent;
  outcome: LiveOutcome;
  /** Card duration in ms; 0 means until dismissed. */
  duration: number;
  paused: boolean;
  /** Activities waiting after the current one. */
  queued: number;
}

/** Methods the toolbar needs; not part of the public controller type. */
export interface LiveControllerInternals extends BubbleLiveActivityController {
  getSnapshot: () => LiveSnapshot;
  /** Registers a toolbar rendering this controller. Returns the disconnect function. */
  connect: () => () => void;
  pause: () => void;
  resume: () => void;
  options: BubbleLiveActivityOptions;
}

type Settled = { ok: true; value: unknown } | { ok: false; error: unknown };

interface Job {
  options: BubbleLiveRunOptions<unknown>;
  /** Null while the task runs; always set for `show`. */
  settled: Settled | null;
  content?: BubbleLiveContent;
}

const IDLE: LiveSnapshot = {
  state: 'idle',
  id: 0,
  outcome: 'neutral',
  duration: 0,
  paused: false,
  queued: 0,
};

const isDevelopment = () =>
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !==
  'production';

export const createLiveController = (
  initialOptions: BubbleLiveActivityOptions = {},
): LiveControllerInternals => {
  const listeners = new Set<() => void>();
  const queue: Job[] = [];
  let snapshot = IDLE;
  let current: Job | null = null;
  let connections = 0;
  let warned = false;
  let compactSince = 0;
  let expandTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let remaining = 0;
  let closeStartedAt = 0;

  const update = (next: Partial<LiveSnapshot>) => {
    snapshot = { ...snapshot, ...next, queued: queue.length };
    for (const listener of listeners) {
      listener();
    }
  };

  const clearTimers = () => {
    clearTimeout(expandTimer);
    clearTimeout(closeTimer);
    expandTimer = undefined;
    closeTimer = undefined;
  };

  const startCloseTimer = (ms: number) => {
    remaining = ms;
    closeStartedAt = Date.now();
    closeTimer = setTimeout(controller.dismiss, ms);
  };

  const expand = (job: Job) => {
    const { settled, options } = job;
    let { content } = job;
    let outcome: LiveOutcome = 'neutral';
    if (settled?.ok && !job.content) {
      outcome = 'success';
      content = options.success?.(settled.value);
    } else if (settled && !settled.ok) {
      outcome = 'error';
      content = options.error?.(settled.error);
    }
    const duration = Math.max(0, options.duration ?? controller.options.duration ?? 4000);
    update({ state: 'expanded', content, outcome, duration, paused: false });
    if (duration > 0) {
      startCloseTimer(duration);
    }
  };

  const next = () => {
    clearTimers();
    current = queue.shift() ?? null;
    if (!current) {
      update({ ...IDLE, id: snapshot.id });
      return;
    }
    if (current.settled) {
      update({ id: snapshot.id + 1 });
      expand(current);
      return;
    }
    compactSince = Date.now();
    update({
      state: 'compact',
      id: snapshot.id + 1,
      content: current.options.pending,
      outcome: 'pending',
      duration: 0,
      paused: false,
    });
  };

  const enqueue = (job: Job) => {
    queue.push(job);
    if (!current) {
      next();
    } else {
      update({});
    }
  };

  const onSettled = (job: Job) => {
    if (job !== current || snapshot.state !== 'compact') {
      return;
    }
    const minPending = controller.options.minPendingMs ?? 600;
    const wait = Math.max(0, minPending - (Date.now() - compactSince));
    expandTimer = setTimeout(() => expand(job), wait);
  };

  const controller: LiveControllerInternals = {
    options: initialOptions,

    run<T>(task: () => Promise<T> | T, options: BubbleLiveRunOptions<T> = {}) {
      if (connections === 0 && !warned && isDevelopment()) {
        warned = true;
        console.warn(
          'useBubbleLiveActivity: the controller is not passed to any <BubbleToolbar liveActivity>; activities will not be shown.',
        );
      }
      let promise: Promise<T>;
      try {
        promise = Promise.resolve(task());
      } catch (error) {
        promise = Promise.reject(error);
      }
      const job: Job = { options: options as BubbleLiveRunOptions<unknown>, settled: null };
      void (async () => {
        try {
          job.settled = { ok: true, value: await promise };
        } catch (error) {
          job.settled = { ok: false, error };
        }
        onSettled(job);
      })();
      enqueue(job);
      return promise;
    },

    show(content, options = {}) {
      enqueue({ options, settled: { ok: true, value: undefined }, content });
    },

    dismiss() {
      if (current) {
        next();
      }
    },

    get state() {
      return snapshot.state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot: () => snapshot,

    connect() {
      connections += 1;
      return () => {
        connections -= 1;
      };
    },

    pause() {
      if (snapshot.state !== 'expanded' || snapshot.paused || !closeTimer) {
        return;
      }
      clearTimeout(closeTimer);
      closeTimer = undefined;
      remaining = Math.max(0, remaining - (Date.now() - closeStartedAt));
      update({ paused: true });
    },

    resume() {
      if (snapshot.state !== 'expanded' || !snapshot.paused) {
        return;
      }
      update({ paused: false });
      startCloseTimer(remaining);
    },
  };

  return controller;
};
