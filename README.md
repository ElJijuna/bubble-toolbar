# 🫧 Bubble Toolbar

[![Version](https://img.shields.io/badge/version-0.1.0-blue)](./package.json)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](./tsconfig.json)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)](./.storybook/main.ts)
[![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)](./eslint.config.mjs)
[![Biome](https://img.shields.io/badge/Biome-2-60A5FA?logo=biome&logoColor=white)](./biome.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

A responsive floating toolbar with a frosted glass effect for React 18 and 19. Built with TypeScript, it arranges content into groups that adapt from circles to pills based on their children.

## Features

- **React 18 and 19 support:** typed components with forwarded refs.
- **Group-based composition:** pass arrays of nodes or use `BubbleToolbar.Group` children.
- **Adaptive shapes:** a single child creates a circle; multiple children create a pill.
- **Frosted glass:** background blur, subtle borders, soft shadows, and glass, light, dark, or automatic themes.
- **Responsive layout:** fixed or relative positioning, automatic centering, and horizontal scrolling on smaller screens.
- **Tests and examples:** Jest and React Testing Library tests, plus interactive Storybook stories.

## Installation

```bash
npm install bubble-toolbar
# Or use pnpm:
pnpm add bubble-toolbar
```

## Quick start

### Group arrays

```tsx
import { BubbleArea, BubbleIconButton, BubbleToolbar } from 'bubble-toolbar';
import 'bubble-toolbar/styles.css';

const App = () => (
  <BubbleToolbar
    position="bottom"
    theme="glass"
    groups={[
      // One child: circle.
      [<BubbleIconButton key="logo" name="logo" />],

      // Multiple children: pill.
      [
        <BubbleIconButton key="search" name="search" />,
        <BubbleArea key="area">
          <input aria-label="Search" placeholder="Search or type /" />
        </BubbleArea>,
      ],

      // Each group below becomes a circle.
      [<BubbleIconButton key="theme" name="theme" />],
      [<BubbleIconButton key="chat" name="chat" />],
      [<BubbleIconButton key="notifications" name="notifications" badge={3} />],
    ]}
  />
);
```

### Compound components

```tsx
import { BubbleArea, BubbleIconButton, BubbleToolbar } from 'bubble-toolbar';
import 'bubble-toolbar/styles.css';

const FloatingMenu = () => (
  <BubbleToolbar position="bottom" theme="glass">
    <BubbleToolbar.Group>
      <BubbleIconButton name="logo" />
    </BubbleToolbar.Group>

    <BubbleToolbar.Group>
      <BubbleIconButton name="search" />
      <BubbleArea>
        <input aria-label="Search" placeholder="Search…" />
      </BubbleArea>
    </BubbleToolbar.Group>

    <BubbleToolbar.Group>
      <BubbleIconButton name="theme" />
    </BubbleToolbar.Group>
  </BubbleToolbar>
);
```

The components include inline glass styles. Import the stylesheet for additional styling, including automatic dark theme support and focus indicators.

## Adaptive shapes

| Group content | Shape | Behavior |
| :--- | :--- | :--- |
| One child | Circle | Equal width and height, with centered content. The default diameter is 48px. |
| Multiple children | Pill | Fixed height, content-based width, horizontal spacing, and rounded ends. |

Use the `shape` prop on a group to override its automatic shape.

## API reference

### `<BubbleToolbar />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `groups` | `ReactNode[][]` | `undefined` | Arrays of grouped nodes. |
| `children` | `ReactNode` | `undefined` | Children such as `<BubbleToolbar.Group>`. |
| `position` | `'bottom' \| 'top' \| 'static' \| 'custom'` | `'bottom'` | Toolbar placement. Use `style` to set custom positioning. |
| `theme` | `'glass' \| 'light' \| 'dark' \| 'auto'` | `'glass'` | Visual theme. |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Group height and circle diameter: 40px, 48px, 56px, or a custom pixel value. |
| `blurred` | `boolean` | `true` | Enables background blur. |
| `blurAmount` | `number \| string` | `16` | Blur radius in pixels or a CSS length. |
| `groupGap` | `number \| string` | `8` | Space between groups, in pixels or a CSS length. |
| `itemGap` | `number \| string` | `8` | Space between children within a pill. |
| `bordered` | `boolean` | `true` | Shows subtle borders. |
| `shadow` | `boolean \| string` | `true` | Enables the default shadow or supplies a custom CSS shadow. |
| `ariaLabel` | `string` | `'Toolbar'` | Accessible toolbar label. |

### `<BubbleGroup />` / `<BubbleToolbar.Group />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `undefined` | Group content. |
| `shape` | `'circle' \| 'pill'` | Automatic | Overrides the shape inferred from the child count. |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | Inherited | Overrides the toolbar's group size. |
| `itemGap` | `number \| string` | Inherited | Overrides spacing between children. |

### `<BubbleIconButton />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | `undefined` | Built-in icon: `search`, `theme`, `chat`, `notifications`, `logo`, or `close`. |
| `icon` | `ReactNode` | `undefined` | Custom icon content. |
| `badge` | `ReactNode` | `undefined` | Notification indicator or count. |
| `active` | `boolean` | `false` | Applies active styling. |
| `tooltip` | `string` | `undefined` | Tooltip and fallback accessible label. |
| `ariaLabel` | `string` | Derived | Explicit accessible label; falls back to the tooltip or icon name. |

### `<BubbleArea />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `undefined` | Content such as a search input, label, or slider. |
| `minWidth` | `number \| string` | `120` | Minimum width in pixels or a CSS length. |
| `maxWidth` | `number \| string` | `undefined` | Maximum width in pixels or a CSS length. |

All components accept `className`, `style`, and standard attributes for their underlying element. Toolbar, group, and area refs point to a `div`; icon button refs point to a `button`.

## Development

```bash
npm ci
```

ESLint 10 uses `createEslintConfig` from `super-configs/eslint` with the React and Jest presets. Biome extends `super-configs/biome` for linting, formatting, and import organization.

```bash
npm run lint          # Run ESLint with zero warnings allowed
npm run lint:fix      # Apply ESLint fixes
npm run format:check  # Check with Biome
npm run format        # Apply Biome fixes
npm run typecheck     # Check TypeScript types
npm test              # Run Jest tests
npm run test:coverage # Generate a coverage report
npm run check         # Run ESLint, Biome, TypeScript, and Jest
```

### Storybook

The story environment uses Storybook 10 and Vite 8.3.4. Explore components, themes, and adaptive shapes locally:

```bash
npm run storybook
```

Build the static Storybook site:

```bash
npm run build-storybook
```

### Library build

Build the library for distribution as ESM, CommonJS, and TypeScript declarations:

```bash
npm run build
```

Preview the npm package contents:

```bash
npm pack --dry-run
```

## License

[MIT](./LICENSE) © ElJijuna
