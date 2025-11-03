import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Awe-Axios',
  description: 'An annotation-driven enhanced Axios framework',
  markdown: {
    lineNumbers: true,
    breaks: true,
    math: true,
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/en/起步/Quick Start.md' },
      {
        text: 'Locale',
        items: [
          {
            text: '中文',
            link: '/zh/起步/基本介绍',
          },
          {
            text: 'English',
            link: '/en/起步/Basic Introduction',
          },
        ],
      },
    ],
    search: { provider: 'local' },
    outline: {
      level: 'deep',
      label: '目录',
    },
    sidebar: {
      '/zh/': [
        {
          text: '起步',
          items: [
            { text: '基本介绍', link: '/zh/起步/基本介绍' },
            { text: '快速开始', link: '/zh/起步/快速开始' },
          ],
        },
        {
          text: '发送HTTP请求',
          items: [
            { text: '基本请求方法', link: '/zh/发送HTTP请求/基本请求方法' },
            { text: '参数装饰器', link: '/zh/发送HTTP请求/参数装饰器' },
            { text: '常用功能', link: '/zh/发送HTTP请求/常用功能' },
            { text: '子项装饰器', link: '/zh/发送HTTP请求/子项装饰器' },
          ],
        },
        {
          text: 'HTTP请求拦截',
          items: [
            { text: '搭建mock接口', link: '/zh/HTTP请求拦截/搭建mock接口' },
            { text: '取消mock', link: '/zh/HTTP请求拦截/取消mock' },
            { text: '子项装饰器', link: '/zh/HTTP请求拦截/子项装饰器' },
          ],
        },
        {
          text: 'IOC-AOP',
          items: [
            { text: '控制反转', link: '/zh/IOC-AOP/控制反转' },
            { text: '依赖注入', link: '/zh/IOC-AOP/依赖注入' },
            { text: '面向切面', link: '/zh/IOC-AOP/面向切面' },
          ],
        },
        {
          text: '最佳实践',
          items: [
            { text: '封装装饰器', link: '/zh/最佳实践/封装装饰器' },
            { text: '结合数据生成工具', link: '/zh/最佳实践/结合数据生成工具' },
          ],
        },
      ],
      '/en/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Basic Introduction', link: '/en/起步/Basic Introduction' },
            { text: 'Quick Start', link: '/en/起步/Quick Start.md' },
          ],
        },
        {
          text: 'Initiate an HTTP request',
          items: [
            { text: 'Basic Request Methods', link: '/en/发起HTTP请求/Basic Request Methods' },
            { text: 'Common Functions', link: '/en/发起HTTP请求/Common Functions' },
            { text: 'Parameter Decorator', link: '/en/发起HTTP请求/Parameter Decorator' },
            { text: 'Subitem Decorator', link: '/en/发起HTTP请求/Subitem Decorator' },
          ],
        },
        {
          text: 'HTTP request interception',
          items: [
            { text: 'Cancel Mock', link: '/en/HTTP请求拦截/Cancel Mock' },
            { text: 'Mock Interface Setup', link: '/en/HTTP请求拦截/Mock Interface Setup' },
            { text: 'Subitem Decorator', link: '/en/HTTP请求拦截/Subitem Decorator' },
          ],
        },
        {
          text: 'IOC-AOP',
          items: [
            { text: 'Inversion of Control', link: '/en/IOC-AOP/Inversion of Control' },
            { text: 'Dependency Injection', link: '/en/IOC-AOP/Dependency Injection' },
            { text: 'Aspect-Oriented Programming', link: '/en/IOC-AOP/Aspect-Oriented Programming' },
          ],
        },
        {
          text: 'Best Practices',
          items: [
            { text: 'Encapsulation Decorator', link: '/en/最佳实践/Encapsulation Decorator' },
            { text: 'Data Generation Tool Integration', link: '/en/最佳实践/Data Generation Tool Integration' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/bloom-lmh/data-faker.git' }],
  },
});
