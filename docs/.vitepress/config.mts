import { defineConfig } from 'vitepress';

const enSidebar = [
  {
    text: 'Guide',
    items: [
      { text: 'Overview', link: '/en/' },
      { text: 'Getting Started', link: '/en/getting-started' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'HTTP Decorators', link: '/en/core' },
      { text: 'Runtime Decorators', link: '/en/extensions' },
      { text: 'Mock', link: '/en/mock' },
      { text: 'IoC and AOP', link: '/en/ioc-aop' },
    ],
  },
];

const zhSidebar = [
  {
    text: '指南',
    items: [
      { text: '概览', link: '/zh/' },
      { text: '快速开始', link: '/zh/getting-started' },
    ],
  },
  {
    text: '参考',
    items: [
      { text: 'HTTP 装饰器', link: '/zh/core' },
      { text: '运行时装饰器', link: '/zh/extensions' },
      { text: 'Mock', link: '/zh/mock' },
      { text: 'IoC / AOP', link: '/zh/ioc-aop' },
    ],
  },
];

export default defineConfig({
  title: 'Decoraxios',
  description: 'Decorator-first HTTP, mock, and IoC/AOP toolkit built on Axios.',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'English', link: '/en/' },
      { text: '中文', link: '/zh/' },
      { text: 'GitHub', link: 'https://github.com/bloom-lmh/decoraxios' },
    ],
    sidebar: {
      '/en/': enSidebar,
      '/zh/': zhSidebar,
    },
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
    },
    editLink: {
      pattern: 'https://github.com/bloom-lmh/decoraxios/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Decoraxios documentation',
      copyright: 'MIT Licensed',
    },
  },
});
