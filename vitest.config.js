import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    resetMocks: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js', 'modules/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['modules/**'],
      exclude: [
        'config/**',
        'middlewares/**',
        'app.js',
        'bin/**',
        'modules/**/__tests__/**',
        'modules/**/index.js',
      ],
    },
    testTimeout: 10000,
  },
});
