import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@decoraxios/all', replacement: resolve(__dirname, 'packages/all/src/index.ts') },
      { find: '@decoraxios/core', replacement: resolve(__dirname, 'packages/core/src/index.ts') },
      { find: '@decoraxios/mock', replacement: resolve(__dirname, 'packages/mock/src/index.ts') },
      { find: '@decoraxios/ioc-aop', replacement: resolve(__dirname, 'packages/ioc-aop/src/index.ts') },
      { find: 'decoraxios/core', replacement: resolve(__dirname, 'packages/decoraxios/src/core.ts') },
      { find: 'decoraxios', replacement: resolve(__dirname, 'packages/decoraxios/src/index.ts') },
      { find: 'awe-axios/core', replacement: resolve(__dirname, 'packages/awe-axios/core.js') },
      { find: 'awe-axios', replacement: resolve(__dirname, 'packages/awe-axios/index.js') },
      { find: '@decoraxios/awe-axios-core', replacement: resolve(__dirname, 'packages/compat-awe-axios-core/index.js') },
      { find: '@decoraxios/awe-axios-mock', replacement: resolve(__dirname, 'packages/compat-awe-axios-mock/index.js') },
      { find: '@decoraxios/awe-axios-ioc-aop', replacement: resolve(__dirname, 'packages/compat-awe-axios-ioc-aop/index.js') },
      { find: '@decoraxios/awe-axios-all', replacement: resolve(__dirname, 'packages/compat-awe-axios-all/index.js') },
    ],
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/*/src/__tests__/**/*.test.ts']
  }
});
