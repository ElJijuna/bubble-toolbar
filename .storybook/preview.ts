import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    backgrounds: {
      options: {
        gradient: {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 35%, #fcb045 100%)',
        },
        dark: {
          name: 'dark',
          value: '#090d16',
        },
        light: {
          name: 'light',
          value: '#f1f5f9',
        },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'gradient' },
  },
};

export default preview;
