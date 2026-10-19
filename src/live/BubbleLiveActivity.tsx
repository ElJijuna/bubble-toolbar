import type { CSSProperties, ReactNode, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { BubbleGroup } from '../BubbleGroup';
import { BubbleIconButton } from '../components/BubbleIconButton';
import { useBubbleToolbar } from '../context';
import type { BubbleLiveActivityController, BubbleLiveLabels, BubbleLiveTokens } from '../types';
import { resolveSize } from '../utils/styles';
import type { TokenMap } from '../utils/tokens';
import { createTokenStyle } from '../utils/tokens';
import { asInternals } from './useBubbleLiveActivity';

const LIVE_TOKENS: TokenMap<keyof BubbleLiveTokens> = {
  compactWidth: ['--bubble-live-compact-width', 'px'],
  width: ['--bubble-live-width', 'px'],
  radius: ['--bubble-live-radius', 'px'],
  progressColor: ['--bubble-live-progress-color', ''],
  successColor: ['--bubble-live-success-color', ''],
  errorColor: ['--bubble-live-error-color', ''],
  titleSize: ['--bubble-live-title-size', 'px'],
  metaSize: ['--bubble-live-meta-size', 'px'],
  duration: ['--bubble-live-duration', 'ms'],
};

export const liveTokensToStyle = createTokenStyle(LIVE_TOKENS);

export const defaultLiveLabels: BubbleLiveLabels = {
  pending: 'Working…',
  success: 'Done',
  error: 'Something went wrong',
  close: 'Dismiss',
  group: 'Live activity',
};

/** Fallback when transitionend never fires (no CSS, hidden tab, jsdom). */
const LEAVE_FALLBACK_MS = 650;
const MORPH = 'clamp(0ms, var(--bubble-live-duration, 320ms), 600ms) cubic-bezier(0.16, 1, 0.3, 1)';
const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const svg = (children: ReactNode, className?: string) => (
  <svg
    aria-hidden="true"
    focusable="false"
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const ICONS = {
  pending: svg(<path d="M21 12a9 9 0 1 1-6.22-8.56" />, 'bubble-live__spinner'),
  success: svg(<polyline points="20 6 9 17 4 12" />),
  error: svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>,
  ),
  neutral: null,
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

type Visual = 'idle' | 'enter' | 'live' | 'leave';

interface LiveSlotProps {
  controller: BubbleLiveActivityController;
  toolbarRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

/**
 * Keeps the toolbar groups mounted (hidden and inert while live) and morphs a single group
 * from the toolbar width into the compact pill, then the card, and back.
 */
export const LiveSlot = ({ controller, toolbarRef, children }: LiveSlotProps) => {
  const live = asInternals(controller);
  const context = useBubbleToolbar();
  const snapshot = useSyncExternalStore(live.subscribe, live.getSnapshot, live.getSnapshot);
  const [visual, setVisual] = useState<Visual>('idle');
  const fromWidth = useRef(0);
  const savedFocus = useRef<HTMLElement | null>(null);
  const groupsRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const interaction = useRef({ hover: false, focus: false });
  const active = snapshot.state !== 'idle';
  const labels = { ...defaultLiveLabels, ...live.options.labels };

  useEffect(() => live.connect(), [live]);

  useLayoutEffect(() => {
    if (active && (visual === 'idle' || visual === 'leave')) {
      if (visual === 'idle') {
        const toolbar = toolbarRef.current;
        fromWidth.current = toolbar ? Math.max(0, toolbar.getBoundingClientRect().width - 8) : 0;
        const focused = document.activeElement;
        savedFocus.current =
          focused instanceof HTMLElement && groupsRef.current?.contains(focused) ? focused : null;
      }
      setVisual(prefersReducedMotion() || !fromWidth.current ? 'live' : 'enter');
    } else if (!active && (visual === 'enter' || visual === 'live')) {
      setVisual(prefersReducedMotion() || !fromWidth.current ? 'idle' : 'leave');
    }
  }, [active, visual, toolbarRef]);

  useLayoutEffect(() => {
    if (groupsRef.current) {
      groupsRef.current.inert = visual !== 'idle';
    }
  }, [visual]);

  // Paint the measured width first, then let the transition shrink it.
  useEffect(() => {
    if (visual !== 'enter') {
      return;
    }
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setVisual('live'));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [visual]);

  useEffect(() => {
    if (visual !== 'leave') {
      return;
    }
    const timer = setTimeout(() => setVisual('idle'), LEAVE_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [visual]);

  useEffect(() => {
    if (visual === 'idle') {
      interaction.current = { hover: false, focus: false };
      if (savedFocus.current?.isConnected) {
        savedFocus.current.focus();
      }
      savedFocus.current = null;
    } else if (savedFocus.current && !liveRef.current?.contains(document.activeElement)) {
      liveRef.current?.focus();
    }
  }, [visual]);

  const syncPause = () => {
    const { hover, focus } = interaction.current;
    if (hover || focus) {
      live.pause();
    } else {
      live.resume();
    }
  };

  const size = resolveSize(context.size);
  const expanded = snapshot.state === 'expanded' && visual === 'live';
  const { outcome } = snapshot;
  const tone = snapshot.content?.tone ?? (outcome === 'pending' ? 'neutral' : outcome);
  const title =
    snapshot.content?.title ??
    (outcome === 'pending'
      ? labels.pending
      : outcome === 'error'
        ? labels.error
        : outcome === 'success'
          ? labels.success
          : '');
  const description = snapshot.content?.description;
  const icon = snapshot.content?.icon ?? ICONS[outcome === 'pending' ? 'pending' : tone];
  const announcement = active
    ? [title, expanded ? description : ''].filter(Boolean).join('. ')
    : '';

  const width =
    visual === 'enter' || visual === 'leave'
      ? `${fromWidth.current}px`
      : snapshot.state === 'expanded'
        ? 'min(var(--bubble-live-width, 360px), calc(100vw - 32px))'
        : 'min(var(--bubble-live-compact-width, 200px), calc(100vw - 32px))';

  const groupStyle: CSSProperties = {
    ...liveTokensToStyle(live.options.tokens),
    width,
    minWidth: `${size}px`,
    height: snapshot.state === 'expanded' ? 'auto' : `${size}px`,
    minHeight: `${size}px`,
    padding: 0,
    gap: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: snapshot.state === 'expanded' ? 'var(--bubble-live-radius, 24px)' : '9999px',
    transition: `width ${MORPH}, border-radius ${MORPH}`,
  };

  return (
    <>
      <div ref={groupsRef} style={{ display: visual === 'idle' ? 'contents' : 'none' }}>
        {children}
      </div>
      {visual === 'idle' ? null : (
        <BubbleGroup
          ref={liveRef}
          className="bubble-live"
          shape="pill"
          busy={snapshot.state === 'compact'}
          aria-label={labels.group}
          data-state={visual === 'leave' ? 'leaving' : snapshot.state}
          data-tone={tone}
          tabIndex={-1}
          style={groupStyle}
          onTransitionEnd={(event) => {
            if (
              visual === 'leave' &&
              event.target === liveRef.current &&
              event.propertyName === 'width'
            ) {
              setVisual('idle');
            }
          }}
          onMouseEnter={() => {
            interaction.current.hover = true;
            syncPause();
          }}
          onMouseLeave={() => {
            interaction.current.hover = false;
            syncPause();
          }}
          onFocus={() => {
            interaction.current.focus = true;
            syncPause();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              interaction.current.focus = false;
              syncPause();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && snapshot.state === 'expanded') {
              event.preventDefault();
              live.dismiss();
            }
          }}
        >
          {active ? (
            <div
              key={snapshot.id}
              className="bubble-live__body"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
                minHeight: `${size - (context.bordered ? 2 : 0)}px`,
                padding: expanded ? '10px 6px 10px 14px' : '0 14px',
                boxSizing: 'border-box',
              }}
            >
              {icon ? (
                <span
                  className="bubble-live__icon"
                  aria-hidden="true"
                  style={{
                    display: 'inline-flex',
                    flexShrink: 0,
                    color:
                      tone === 'success'
                        ? 'var(--bubble-live-success-color, #22c55e)'
                        : tone === 'error'
                          ? 'var(--bubble-live-error-color, #ef4444)'
                          : 'inherit',
                  }}
                >
                  {icon}
                </span>
              ) : null}
              <span
                className="bubble-live__text"
                style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minWidth: 0 }}
              >
                <span
                  className="bubble-live__title"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 'clamp(11px, var(--bubble-live-title-size, 13px), 18px)',
                    fontWeight: 600,
                  }}
                >
                  {title}
                </span>
                {expanded && description ? (
                  <span
                    className="bubble-live__description"
                    style={{
                      fontSize: 'clamp(9px, var(--bubble-live-meta-size, 11px), 14px)',
                      lineHeight: 1.4,
                      opacity: 0.75,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {description}
                  </span>
                ) : null}
              </span>
              {snapshot.state === 'compact' && snapshot.queued > 0 ? (
                <span
                  className="bubble-live__queued"
                  style={{ flexShrink: 0, fontSize: 11, opacity: 0.7 }}
                >
                  +{snapshot.queued}
                </span>
              ) : null}
              {expanded ? (
                <BubbleIconButton name="close" ariaLabel={labels.close} onClick={live.dismiss} />
              ) : null}
            </div>
          ) : null}
          {expanded && snapshot.duration > 0 ? (
            <span
              key={`progress-${snapshot.id}`}
              className="bubble-live__progress"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 2,
                animationDuration: `${snapshot.duration}ms`,
                animationPlayState: snapshot.paused ? 'paused' : 'running',
              }}
            />
          ) : null}
        </BubbleGroup>
      )}
      <span
        role="status"
        aria-live="polite"
        className="bubble-live__announcer"
        style={VISUALLY_HIDDEN}
      >
        {tone === 'error' ? '' : announcement}
      </span>
      <span role="alert" className="bubble-live__announcer" style={VISUALLY_HIDDEN}>
        {tone === 'error' ? announcement : ''}
      </span>
    </>
  );
};
