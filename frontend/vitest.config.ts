import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Vitest config is kept separate from vite.config.ts so the production build
// (tsc -b) never type-checks the Vitest `test` field, which clashes with the
// rolldown-based Vite 8 plugin types.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
);
