import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.{js,mjs}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['models/**', 'controllers/**', 'middlewares/**', 'routes/**'],
    },
    testTimeout: 10000,
  },
});
