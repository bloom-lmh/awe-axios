const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const { resolve } = require('path');
const copy = require('rollup-plugin-copy');
// 控制是否压缩（可通过命令行传入 --environment PRODUCTION）
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  input: 'src/index.ts',

  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: isProduction ? false : true, // 生产环境可关闭 sourcemap 提升性能
      exports: 'named',
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: isProduction ? false : true,
      exports: 'named',
    },
    {
      file: 'dist/index.iife.js',
      format: 'iife',
      name: 'AxiosPlus',
      sourcemap: isProduction ? false : true,
      exports: 'named',
    },
  ],

  external: [],

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
    copy({
      targets: [
        { src: 'src/**/*.d.ts', dest: 'dist/types' }, // 将 src 下的 .d.ts 文件复制到 dist/types
      ],
      hook: 'writeBundle', // 在打包完成后执行
    }),
    // 只在生产环境启用压缩
    isProduction &&
      terser({
        compress: {
          drop_console: true, // 可选：移除 console.log
          drop_debugger: true,
        },
        format: {
          comments: false, // 移除注释
        },
      }),
  ].filter(Boolean), // 过滤掉 false（即非生产环境不启用 terser）
};
