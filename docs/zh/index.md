# 总览

Awe Axios 是一个围绕装饰器设计的 Axios 增强工具集。

现在项目已经拆成了三个职责清晰的包：

- `@awe-axios/core`
- `@awe-axios/mock`
- `@awe-axios/ioc-aop`

如果你更喜欢过去那种单入口体验，也可以直接安装 `awe-axios`，它会把这三个包全部重新导出。

## 为什么要重构

旧版本把 HTTP 装饰器、mock、IoC、AOP 都堆在一个包里，结果带来了几个持续性问题：

- mock 打开和关闭时，方法调用方式不一致
- 内部状态管理过重，功能一多就容易出 bug
- TypeScript 提示跟不上装饰器 API 的真实行为

这次重构的核心就是把这些问题拆开解决。

## 现在的收益

- 请求方法稳定返回 `Promise<AxiosResponse<T>>`
- mock 变成独立能力，按需安装
- IoC / AOP 可以单独使用
- 构建、测试、文档都以 package 为中心组织

下一步可以先看 [快速开始](./getting-started)。
