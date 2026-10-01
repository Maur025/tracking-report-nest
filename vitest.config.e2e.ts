import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    environment: 'node',
    env: {
      NODE_ENV: 'test',
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
