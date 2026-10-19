import type { Meta, StoryObj } from '@storybook/react';
import { BubbleIconButton, BubbleSearch, BubbleToolbar } from '../src';
import { DOCS, searchDocs } from './searchData';

const meta = {
  title: 'Components/BubbleSearch',
  component: BubbleSearch,
  tags: ['autodocs'],
  args: {
    onSearch: searchDocs,
    onSelect: () => {},
    suggestions: DOCS.slice(0, 3),
    debounceMs: 0,
  },
  render: (args) => (
    <div style={{ padding: 32, minHeight: 420, fontFamily: 'system-ui, sans-serif' }}>
      <BubbleToolbar position="static" style={{ alignItems: 'flex-start' }}>
        <BubbleToolbar.Group>
          <BubbleIconButton name="logo" ariaLabel="Home" />
        </BubbleToolbar.Group>
        <BubbleSearch {...args} />
        <BubbleToolbar.Group>
          <BubbleIconButton name="notifications" ariaLabel="Notifications" badge={2} />
        </BubbleToolbar.Group>
      </BubbleToolbar>
    </div>
  ),
} satisfies Meta<typeof BubbleSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Debounced: Story = { args: { debounceMs: 300 } };
export const Localized: Story = {
  args: {
    labels: {
      group: 'Buscar',
      button: 'Buscar',
      input: 'Buscar en la documentación',
      listbox: 'Resultados',
      placeholder: 'Buscar…',
      searching: 'Buscando…',
      noResults: 'Sin resultados. Prueba otro término.',
      suggestions: 'Sugerencias',
      results: (count) => `${count} resultados`,
      hint: '↑ ↓ para explorar · Enter para elegir · Esc para cerrar',
    },
  },
};

/** In bottom toolbars the panel opens upward; align groups to the bottom edge. */
export const BottomToolbar: Story = {
  render: (args) => (
    <div style={{ minHeight: 480, fontFamily: 'system-ui, sans-serif' }}>
      <BubbleToolbar style={{ alignItems: 'flex-end' }}>
        <BubbleToolbar.Group>
          <BubbleIconButton name="logo" ariaLabel="Home" />
        </BubbleToolbar.Group>
        <BubbleSearch {...args} />
        <BubbleToolbar.Group>
          <BubbleIconButton name="notifications" ariaLabel="Notifications" badge={2} />
        </BubbleToolbar.Group>
      </BubbleToolbar>
    </div>
  ),
};
