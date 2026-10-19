import type { Meta, StoryObj } from '@storybook/react';
import type { BubbleLiveActivityController, BubbleToolbarProps } from '../src';
import { BubbleIconButton, BubbleToolbar, useBubbleLiveActivity } from '../src';

const wait = <T,>(ms: number, value: T, fail = false) =>
  new Promise<T>((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('Network error')) : resolve(value)), ms),
  );

type Scenario = (live: BubbleLiveActivityController) => void;

const SCENARIOS: Record<string, Scenario> = {
  upload: (live) =>
    void live.run(() => wait(2200, 3), {
      pending: { title: 'Uploading files…' },
      success: (count) => ({
        title: 'Upload complete',
        description: `${count} files are ready to share.`,
      }),
    }),
  error: (live) =>
    void (async () => {
      try {
        await live.run(() => wait(1800, 0, true), {
          pending: { title: 'Syncing…' },
          error: (error) => ({
            title: 'Sync failed',
            description: `${(error as Error).message}. Try again in a minute.`,
          }),
        });
      } catch {
        // Already shown in the toolbar.
      }
    })(),
  queue: (live) => {
    for (const [index, ms] of [1500, 600, 2400].entries()) {
      void live.run(() => wait(ms, index + 1), {
        pending: { title: `Task ${index + 1}…` },
        success: (n) => ({ title: `Task ${n} done` }),
        duration: 2000,
      });
    }
  },
  show: (live) =>
    live.show({ title: 'Saved', description: 'Your draft is safe.' }, { duration: 3000 }),
};

const Demo = ({ scenario, ...args }: BubbleToolbarProps & { scenario: keyof typeof SCENARIOS }) => {
  const live = useBubbleLiveActivity();
  return (
    <div
      style={{
        minHeight: 420,
        padding: 32,
        fontFamily: 'system-ui, sans-serif',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <button
        type="button"
        onClick={() => SCENARIOS[scenario](live)}
        style={{ padding: '10px 18px', borderRadius: 999, border: 0, cursor: 'pointer' }}
      >
        Start “{scenario}”
      </button>
      <BubbleToolbar {...args} liveActivity={live}>
        <BubbleToolbar.Group>
          <BubbleIconButton name="logo" ariaLabel="Home" />
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <BubbleIconButton name="search" ariaLabel="Search" />
          <BubbleIconButton name="theme" ariaLabel="Theme" />
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <BubbleIconButton name="chat" ariaLabel="Messages" />
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <BubbleIconButton name="notifications" ariaLabel="Notifications" badge={3} />
        </BubbleToolbar.Group>
      </BubbleToolbar>
    </div>
  );
};

const meta = {
  title: 'Components/BubbleLiveActivity',
  component: Demo,
  tags: ['autodocs'],
  args: { scenario: 'upload', position: 'top', theme: 'glass' },
  argTypes: { scenario: { control: 'select', options: Object.keys(SCENARIOS) } },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Upload: Story = {};
export const ErrorCard: Story = { name: 'Error', args: { scenario: 'error' } };
export const Queue: Story = { args: { scenario: 'queue' } };
export const ShowWithoutTask: Story = { args: { scenario: 'show' } };
export const Bottom: Story = { args: { position: 'bottom' } };
