import { defineConfig } from 'vitepress';

const enSidebar = [
  {
    text: 'Guide',
    items: [
      { text: 'Overview', link: '/en/' },
      { text: 'Getting Started', link: '/en/getting-started' },
      { text: 'Package Selection', link: '/en/packages' },
      { text: 'Migration Guide', link: '/en/migration' },
    ],
  },
  {
    text: 'Features',
    items: [
      { text: 'Core HTTP', link: '/en/core' },
      { text: 'Mock', link: '/en/mock' },
      { text: 'IoC and AOP', link: '/en/ioc-aop' },
      { text: 'Recipes', link: '/en/recipes' },
    ],
  },
];

const zhSidebar = [
  {
    text: '指南',
    items: [
      { text: '概览', link: '/zh/' },
      { text: '快速开始', link: '/zh/getting-started' },
      { text: '包选择', link: '/zh/packages' },
      { text: '迁移指南', link: '/zh/migration' },
    ],
  },
  {
    text: '功能',
    items: [
      { text: 'Core HTTP', link: '/zh/core' },
      { text: 'Mock', link: '/zh/mock' },
      { text: 'IoC / AOP', link: '/zh/ioc-aop' },
      { text: 'Recipes', link: '/zh/recipes' },
    ],
  },
];

export default defineConfig({
  title: 'Awe Axios',
  description: 'Decorator-first Axios toolkit with a core-first package split',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: {
      src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2218%22 fill=%22%23f66b3d%22/%3E%3Cpath d=%22M20 43 32 16l12 27h-7l-2.2-5.5h-5.6L27 43Z%22 fill=%22white%22/%3E%3C/svg%3E',
      alt: 'Awe Axios',
    },
    nav: [
      { text: 'English', link: '/en/' },
      { text: '中文', link: '/zh/' },
      { text: 'GitHub', link: 'https://github.com/bloom-lmh/awe-axios' },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: 'On This Page',
    },
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
    editLink: {
      pattern: 'https://github.com/bloom-lmh/awe-axios/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Built with VitePress and published from the Awe Axios monorepo.',
      copyright: 'MIT Licensed',
    },
    sidebar: {
      '/en/': enSidebar,
      '/zh/': zhSidebar,
    },
  },
});
