// rollup.config.cjs
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { resolve } = require('path');

module.exports = {
  input: 'src/index.ts',

  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  ],

  external: ['axios'],

  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: resolve(__dirname, 'tsconfig.json'),
      declaration: true,
      declarationDir: 'dist/types',
      emitDeclarationOnly: false,
    }),
  ],
};
