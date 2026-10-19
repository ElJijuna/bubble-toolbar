import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { BubbleBreadcrumbSearchProps } from '../src';
import { BubbleBreadcrumbSearch, BubbleIconButton, BubbleToolbar } from '../src';
import { DOCS, searchDocs } from './searchData';

const toItems = (description = '') => description.split(' / ').map((label) => ({ label }));

const Demo = (args: BubbleBreadcrumbSearchProps) => {
  const [items, setItems] = useState(args.items);
  return (
    <div style={{ padding: 32, minHeight: 420, fontFamily: 'system-ui, sans-serif' }}>
      <BubbleToolbar position="static" theme="glass" style={{ alignItems: 'flex-start' }}>
        <BubbleToolbar.Group>
          <BubbleIconButton name="logo" ariaLabel="Home" />
        </BubbleToolbar.Group>
        <BubbleBreadcrumbSearch
          {...args}
          items={items}
          onSelect={(item) => setItems(toItems(item.description))}
        />
      </BubbleToolbar>
    </div>
  );
};

const meta = {
  title: 'Components/BubbleBreadcrumbSearch',
  component: BubbleBreadcrumbSearch,
  tags: ['autodocs'],
  args: {
    items: toItems('Docs / Design / A very long section name / Themes'),
    onSearch: searchDocs,
    onSelect: () => {},
    suggestions: DOCS.slice(0, 3),
    labels: { location: 'Current page' },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof BubbleBreadcrumbSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomSeparator: Story = { args: { separator: '›' } };

/** Every visual change goes through tokens; layout and behavior stay fixed. */
export const Theming: Story = {
  args: {
    tokens: {
      width: 420,
      radius: 14,
      focusRing: '#f97316',
      optionActiveBg: 'rgb(249 115 22 / 16%)',
      optionRadius: 8,
      titleSize: 14,
      titleWeight: 700,
      duration: 260,
      breadcrumbSeparatorColor: '#f97316',
      breadcrumbCurrentWeight: 700,
    },
  },
};
