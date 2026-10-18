# 🫧 Bubble Toolbar

[![npm version](https://img.shields.io/npm/v/bubble-toolbar)](https://www.npmjs.com/package/bubble-toolbar)
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

## Async activity

Import `bubble-toolbar/styles.css` to enable the rotating border and glow. Activity is indeterminate: it does not disable controls, cancel tasks, or display success or error states.

### External control

Set `busy` on the toolbar to illuminate every group, or on a group to illuminate only that bubble:

```tsx
<BubbleToolbar busy={isSaving}>
  <BubbleToolbar.Group>
    <BubbleIconButton name="logo" />
  </BubbleToolbar.Group>
  <BubbleToolbar.Group busy={isSearching}>
    <BubbleIconButton name="search" />
    <BubbleArea>Search results</BubbleArea>
  </BubbleToolbar.Group>
</BubbleToolbar>
```

### Track tasks from inside a group

`useBubbleActivity()` returns `{ isBusy, run }`. It targets the nearest group, including groups created through the `groups` prop. Calling it outside a group throws a descriptive error.

```tsx
import { useState } from 'react';
import { BubbleIconButton, BubbleToolbar, useBubbleActivity } from 'bubble-toolbar';
import 'bubble-toolbar/styles.css';

const SaveAction = ({ save }: { save: () => Promise<void> }) => {
  const { isBusy, run } = useBubbleActivity();
  const [error, setError] = useState<string | null>(null);

  return (
    <BubbleIconButton
      name="chat"
      tooltip={error ?? (isBusy ? 'Saving…' : 'Save')}
      onClick={async () => {
        setError(null);
        try {
          await run(save);
        } catch {
          setError('Save failed. Try again.');
        }
      }}
    />
  );
};

// Render SaveAction inside a group:
// <BubbleToolbar.Group><SaveAction save={saveChanges} /></BubbleToolbar.Group>
```

`run<T>(task: () => Promise<T>): Promise<T>` returns the task's result and propagates synchronous exceptions and rejected promises. Handle errors in your application. Concurrent tasks keep the group busy until the last task settles. Unmounting the group does not cancel the consumer's task.

A group is busy when **any** of the following is true: the toolbar's `busy` prop, the group's `busy` prop, or a pending local task. Passing `busy={false}` does not hide activity from another source. Each group exposes its effective state through `aria-busy`.

Both toolbar and group accept these props; group appearance overrides the toolbar defaults:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `busy` | `boolean` | `false` | Adds externally managed activity. |
| `activityColors` | `readonly [string, string, string]` | `['#22d3ee', '#8b5cf6', '#ec4899']` | Three CSS colors for the gradient. |
| `activityDuration` | `number` | `2.4` | Seconds per rotation; non-positive or non-finite values fall back to 2.4. |

The effect follows circular and pill shapes without changing their dimensions. With `prefers-reduced-motion: reduce`, the border remains visible and static. Browsers without animated custom property support retain a static gradient; browsers without CSS masking retain a static colored border.

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

## Releases and deployment

The workflows follow the same release pattern as `react-dockbar` and `super-configs`:

- **CI:** pull requests and pushes to branches other than `main` run type checks, tests, and builds with React 18 and 19. React 19 also runs ESLint, Biome, Storybook, and a package-content check. Pull request commits are validated with commitlint.
- **npm:** after CI passes on `main`, semantic-release calculates the version, generates `CHANGELOG.md` and GitHub release notes, updates package versions, creates a `vX.Y.Z` tag, and publishes `bubble-toolbar` with provenance.
- **GitHub Packages:** each new npm release is mirrored as `@eljijuna/bubble-toolbar` from its release tag. The name change happens only in the publishing job.
- **GitHub Pages:** every validated push to `main` deploys Storybook to [eljijuna.github.io/bubble-toolbar](https://eljijuna.github.io/bubble-toolbar/), even when there is no new package release. Deployment is independent of npm publishing.

### Conventional Commits

Use `type(optional-scope): description` for commits and squash-merge titles:

| Commit | Version change |
| :--- | :--- |
| `fix: correct activity cleanup` | Patch |
| `perf: reduce activity renders` | Patch |
| `feat: add activity colors` | Minor |
| `feat!: replace the group API` | Major |
| Any type with a `BREAKING CHANGE:` footer | Major |
| `docs:`, `test:`, `chore:`, `ci:`, `build:`, `refactor:`, `style:` without breaking changes | No release by themselves |

The highest applicable change determines the release. Without a previous release tag, semantic-release starts at **1.0.0**. Release commits use `chore(release): X.Y.Z [skip ci]` to avoid a release loop. Do not edit release versions or changelog entries manually.

```bash
printf 'feat: add activity colors\n' | npm run commitlint
npm run release:dry-run
```

The dry run needs access to the GitHub repository and publishing credentials to verify permissions. It does not publish a version. Release tooling uses Node.js 24 in CI; use Node.js 24.15 or newer for local release tooling.

### Repository configuration

- Set the Actions secret `NPM_TOKEN` to an npm granular token with publish access to `bubble-toolbar`, allowing the CI publishing workflow to bypass 2FA. It must belong to an account authorized to publish the package name.
- Keep **Settings → Pages → Build and deployment → Source** set to **GitHub Actions**.
- The workflows declare the required `GITHUB_TOKEN` permissions for releases, package publishing, and Pages. If branch protection blocks release commits, allow the release automation to update `main` using an appropriate GitHub App token.
- The **Release** workflow can also be dispatched manually on `main`. To retry a failed mirror after npm succeeded, rerun the failed GitHub Packages job.

Install the mirror with an npm configuration that routes its scope to GitHub Packages:

```ini
@eljijuna:registry=https://npm.pkg.github.com
```

```bash
npm install @eljijuna/bubble-toolbar
```

GitHub Packages installation requires GitHub authentication with package read access. Publishing and deployment happen when the workflows run on GitHub; local setup does not publish packages.

## License

[MIT](./LICENSE) © ElJijuna
