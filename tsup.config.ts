import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'node:fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  external: ['react', 'react-dom'],
  onSuccess: async () => {
    try {
      mkdirSync('dist', { recursive: true });
      copyFileSync('src/styles.css', 'dist/styles.css');
    } catch (err) {
      console.warn('Could not copy styles.css:', err);
    }
  }
});
