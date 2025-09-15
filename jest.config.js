import { transform } from 'typescript';

export default {
  // 使用 ts-jest 预设来处理 TypeScript 文件
  // 这会自动包含必要的 TypeScript 转换配置
  preset: 'ts-jest',

  // 指定测试环境（Node.js 环境）
  // 如果是前端项目，可改为 'jsdom' 或 '@happy-dom/jest-environment'
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!@faker-js/.*)', // 允许转译 @faker-js/faker
  ],
  // 设置根目录为当前目录（通常是 package.json 所在目录）
  // Jest 会基于此目录解析其他路径
  rootDir: '.',

  // 模块路径映射（类似 webpack 的 alias）
  // 这里将 @/ 开头的导入映射到 src/ 目录
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@decorators/(.*)$': '<rootDir>/src/core/decorators/$1',
  },

  // 定义测试文件匹配规则
  testMatch: [
    // 核心模块测试
    '<rootDir>/src/core/**/__test__/*.test.[jt]s?(x)',
    // i18n 模块测试
    '<rootDir>/src/i18n/__test__/*.test.[jt]s?(x)',
    // utils 模块测试
    '<rootDir>/src/utils/__test__/*.test.[jt]s?(x)',
  ],

  // 覆盖率收集范围
  // 这里只收集 src/core 下的 TS 文件（排除测试文件本身）
  collectCoverageFrom: [
    '<rootDir>/src/core/**/*.ts', // 包含所有 .ts 文件
    '!**/__test__/**', // 排除测试目录（通常不需要）
    '!**/*.d.ts', // 排除类型声明文件
  ],

  // 是否显示详细测试结果
  // true：显示所有测试用例的结果（包括通过的测试）
  // false：只显示失败的测试（默认值）
  verbose: true,

  // 其他常见可选配置：
  // transform: {
  //   '^.+\\.tsx?$': 'ts-jest', // 显式指定 TS 转换（preset 已包含）
  // },
  // setupFiles: ['<rootDir>/jest.setup.ts'], // 测试启动文件
  // coverageThreshold: { // 覆盖率阈值
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
  // testTimeout: 10000, // 单个测试超时时间（毫秒）
};
