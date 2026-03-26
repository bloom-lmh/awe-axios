import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Awe Axios',
  description: 'Decorator-first Axios toolkit in a modern monorepo',
  themeConfig: {
    nav: [
      { text: 'English', link: '/en/' },
      { text: '中文', link: '/zh/' },
    ],
    search: {
      provider: 'local',
    },
    sidebar: {
      '/en/': [
        {
          text: 'Guide',
          items: [
            { text: 'Overview', link: '/en/' },
            { text: 'Getting Started', link: '/en/getting-started' },
            { text: 'Package Split', link: '/en/packages' },
            { text: 'Core', link: '/en/core' },
            { text: 'Mock', link: '/en/mock' },
            { text: 'IoC and AOP', link: '/en/ioc-aop' },
          ],
        },
      ],
      '/zh/': [
        {
          text: '指南',
          items: [
            { text: '总览', link: '/zh/' },
            { text: '快速开始', link: '/zh/getting-started' },
            { text: '包拆分说明', link: '/zh/packages' },
            { text: 'Core 核心包', link: '/zh/core' },
            { text: 'Mock 包', link: '/zh/mock' },
            { text: 'IoC / AOP 包', link: '/zh/ioc-aop' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bloom-lmh/awe-axios' }],
  },
});
