import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BubbleArea, BubbleIconButton, BubbleToolbar, useBubbleActivity } from '../src';

const meta = {
  title: 'Components/BubbleActivity',
  component: BubbleToolbar,
  tags: ['autodocs'],
  args: { position: 'static', theme: 'glass' },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 32,
          minHeight: 220,
          background: 'linear-gradient(120deg, #64748b, #c4b5fd)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BubbleToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Circle: Story = {
  args: { busy: true },
  render: (args) => (
    <BubbleToolbar
      {...args}
      groups={[[<BubbleIconButton key="save" name="chat" tooltip="Saving" />]]}
    />
  ),
};

export const Pill: Story = {
  args: { busy: true },
  render: (args) => (
    <BubbleToolbar {...args}>
      <BubbleToolbar.Group>
        <BubbleIconButton name="search" />
        <BubbleArea>Searching…</BubbleArea>
      </BubbleToolbar.Group>
    </BubbleToolbar>
  ),
};

export const ExternalControl: Story = {
  render: function ExternalControlDemo(args) {
    const [busy, setBusy] = useState(false);
    return (
      <div>
        <button
          type="button"
          onClick={() => setBusy((value) => !value)}
          style={{ marginBottom: 24 }}
        >
          {busy ? 'Stop activity' : 'Start activity'}
        </button>
        <div>
          <BubbleToolbar {...args} busy={busy}>
            <BubbleToolbar.Group>
              <BubbleIconButton name="logo" />
            </BubbleToolbar.Group>
            <BubbleToolbar.Group>
              <BubbleIconButton name="search" />
              <BubbleArea>External process</BubbleArea>
            </BubbleToolbar.Group>
          </BubbleToolbar>
        </div>
      </div>
    );
  },
};

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const AsyncActions = () => {
  const { run, isBusy } = useBubbleActivity();
  return (
    <>
      <BubbleIconButton
        name="chat"
        tooltip="Start a 2-second task"
        onClick={() => {
          void run(() => delay(2000));
        }}
      />
      <BubbleIconButton
        name="search"
        tooltip="Start a 5-second task"
        onClick={() => {
          void run(() => delay(5000));
        }}
      />
      <BubbleArea>
        {isBusy ? 'Working… click again to add tasks' : 'Start one or more tasks'}
      </BubbleArea>
    </>
  );
};

export const ConcurrentTasks: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each click registers a task. The group stays illuminated until all tasks finish; the adjacent group stays idle.',
      },
    },
  },
  render: (args) => (
    <BubbleToolbar {...args}>
      <BubbleToolbar.Group shape="pill">
        <AsyncActions />
      </BubbleToolbar.Group>
      <BubbleToolbar.Group>
        <BubbleIconButton name="theme" tooltip="Idle group" />
      </BubbleToolbar.Group>
    </BubbleToolbar>
  ),
};

export const CustomColors: Story = {
  args: { busy: true, activityColors: ['#f59e0b', '#ef4444', '#84cc16'], activityDuration: 4 },
  render: (args) => (
    <BubbleToolbar {...args}>
      <BubbleToolbar.Group>
        <BubbleIconButton name="logo" />
      </BubbleToolbar.Group>
      <BubbleToolbar.Group
        activityColors={['#38bdf8', '#ffffff', '#2563eb']}
        activityDuration={1.2}
      >
        <BubbleIconButton name="search" />
        <BubbleArea>Group override</BubbleArea>
      </BubbleToolbar.Group>
    </BubbleToolbar>
  ),
};

export const ReducedMotion: Story = {
  args: { busy: true },
  parameters: {
    docs: {
      description: {
        story:
          'Static preview of reduced motion. The stylesheet also automatically respects prefers-reduced-motion: reduce.',
      },
    },
  },
  render: (args) => (
    <div className="activity-reduced-preview">
      <style>
        {
          '.activity-reduced-preview .bubble-group--busy::before, .activity-reduced-preview .bubble-group--busy::after { animation: none; }'
        }
      </style>
      <BubbleToolbar {...args}>
        <BubbleToolbar.Group>
          <BubbleIconButton name="logo" />
        </BubbleToolbar.Group>
        <BubbleToolbar.Group>
          <BubbleIconButton name="search" />
          <BubbleArea>Working…</BubbleArea>
        </BubbleToolbar.Group>
      </BubbleToolbar>
    </div>
  ),
};

export const ThemesAndScrolling: Story = {
  args: { busy: true },
  render: (args) => (
    <div style={{ display: 'grid', gap: 32 }}>
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          style={{ padding: 16, background: theme === 'dark' ? '#090d16' : '#f1f5f9' }}
        >
          <BubbleToolbar {...args} theme={theme} style={{ maxWidth: 320 }}>
            <BubbleToolbar.Group>
              <BubbleIconButton name="logo" />
            </BubbleToolbar.Group>
            <BubbleToolbar.Group>
              <BubbleIconButton name="search" />
              <BubbleArea>
                <input aria-label={`${theme} search`} placeholder="Search" />
              </BubbleArea>
            </BubbleToolbar.Group>
            <BubbleToolbar.Group>
              <BubbleIconButton name="chat" />
            </BubbleToolbar.Group>
            <BubbleToolbar.Group>
              <BubbleIconButton name="notifications" />
            </BubbleToolbar.Group>
          </BubbleToolbar>
        </div>
      ))}
    </div>
  ),
};
