import type { Meta, StoryObj } from '@storybook/react';
import { BubbleToolbar } from '../src';
import { BreadcrumbSearchDemo } from './examples/BreadcrumbSearchDemo';

const meta = {
  title: 'Examples/BreadcrumbSearch',
  component: BubbleToolbar,
  parameters: { layout: 'fullscreen' },
  args: { theme: 'glass', blurred: true },
  argTypes: { theme: { control: 'select', options: ['glass', 'light', 'dark'] } },
  render: (args) => <BreadcrumbSearchDemo {...args} />,
} satisfies Meta<typeof BubbleToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BreadcrumbSearch: Story = {};
export const Dark: Story = { args: { theme: 'dark' } };
