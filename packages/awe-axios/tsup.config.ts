import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core.ts',
    mock: 'src/mock.ts',
    'ioc-aop': 'src/ioc-aop.ts',
    all: 'src/all.ts',
  },
  tsconfig: './tsconfig.build.json',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ['@awe-axios/core', '@awe-axios/mock', '@awe-axios/ioc-aop'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
