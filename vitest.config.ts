import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@awe-axios/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@awe-axios/mock': resolve(__dirname, 'packages/mock/src/index.ts'),
      '@awe-axios/ioc-aop': resolve(__dirname, 'packages/ioc-aop/src/index.ts'),
      'awe-axios': resolve(__dirname, 'packages/awe-axios/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/*/src/__tests__/**/*.test.ts']
  }
});
