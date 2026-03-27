import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@decoraxios/awe-axios-all', replacement: resolve(__dirname, 'packages/all/src/index.ts') },
      { find: '@decoraxios/awe-axios-core', replacement: resolve(__dirname, 'packages/core/src/index.ts') },
      { find: '@decoraxios/awe-axios-mock', replacement: resolve(__dirname, 'packages/mock/src/index.ts') },
      { find: '@decoraxios/awe-axios-ioc-aop', replacement: resolve(__dirname, 'packages/ioc-aop/src/index.ts') },
      { find: 'awe-axios/core', replacement: resolve(__dirname, 'packages/awe-axios/src/core.ts') },
      { find: 'awe-axios', replacement: resolve(__dirname, 'packages/awe-axios/src/index.ts') },
    ],
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/*/src/__tests__/**/*.test.ts']
  }
});
