import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AxiosPlus',
  description: 'An annotation-driven enhanced Axios framework',
  markdown: {
    lineNumbers: true,
    breaks: true,
    math: true,
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/zh/起步/基本介绍' },
      {
        text: '国际化',
        items: [
          {
            text: '中文',
            link: '/zh/什么是DataFaker.md',
          },
          {
            text: 'English',
            link: '/en/What is DataFaker.md',
          },
        ],
      },
      { text: 'API', link: '/zh/预设数据.md' },
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
            { text: '自定义装饰器', link: '/zh/发送HTTP请求/自定义装饰器' },
          ],
        },
        {
          text: 'HTTP请求拦截',
          items: [
            { text: '接口二义性', link: '/zh/HTTP请求拦截/接口二义性' },
            { text: '环境感知机制', link: '/zh/HTTP请求拦截/环境感知机制' },
            { text: '数据生成工具', link: '/zh/HTTP请求拦截/数据生成工具' },
          ],
        },
        {
          text: '依赖注入',
          items: [
            { text: '注册类实例', link: '/zh/依赖注入/注册类实例' },
            { text: '注入实例', link: '/zh/依赖注入/注入实例' },
          ],
        },
        {
          text: '面向切面',
          items: [
            { text: '切面方法', link: '/zh/面向切面/切面方法' },
            { text: '上下文机制', link: '/zh/面向切面/上下文机制' },
          ],
        },
      ],
      '/en/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is DataFaker?', link: '/en/What is DataFaker.md' },
            { text: 'Quick Start', link: '/en/Quick Start.md' },
            { text: 'Basic Usage', link: '/en/Basic Usage' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Template Syntax', link: '/en/Template Syntax' },
            { text: 'Unique Values', link: '/en/Unique Values' },
            { text: 'Data References', link: '/en/Data References' },
            { text: 'Data Models', link: '/en/Data Models' },
            { text: 'Multi-Language', link: '/en/Multi-Language Support.md' },
            { text: 'Hooks', link: '/en/Data Generation Hooks.md' },
            { text: 'Data Iterators', link: '/en/Data Iterators' },
          ],
        },
        {
          text: 'Experimental Features',
          items: [
            { text: 'Decorator Syntax', link: '/en/Decorator Syntax' },
            { text: 'Simulating the Business Layer', link: '/en/Simulating the Business Layer' },
          ],
        },
        {
          text: 'Related Links',
          items: [
            { text: 'faker.js', link: 'https://faker.nodejs.cn/guide/unique.html' },
            { text: 'axios-plus', link: 'https://github.com/bloom-lmh/AxiosPlus' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/bloom-lmh/data-faker.git' }],
  },
});
