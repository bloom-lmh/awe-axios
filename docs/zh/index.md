# 总览

Awe Axios 是一个围绕装饰器设计的 Axios 增强工具集。

现在项目已经拆成了更清晰的包结构：

- `awe-axios`
- `@awe-axios/core`
- `@awe-axios/mock`
- `@awe-axios/ioc-aop`
- `@awe-axios/all`

`awe-axios` 现在只代表 core 入口。如果你想要旧的“一次安装一个包”体验，请直接安装 `@awe-axios/all`。

## 为什么要重构

旧版本把 HTTP 装饰器、mock、IoC、AOP 都堆在一个包里，结果带来了几个持续性问题：

- mock 开关前后，方法调用行为不一致
- 内部状态管理过重，功能一多就容易出 bug
- TypeScript 提示跟不上装饰器 API 的真实行为

这次重构的目标就是把这些问题拆开解决。

## 现在能得到什么

- 请求方法稳定返回 `Promise<AxiosResponse<T>>`
- mock 变成独立能力，按需安装
- IoC / AOP 可以单独使用
- 如果想一次拿全套，可以直接安装 `@awe-axios/all`
- 构建、测试、文档都以 package 为中心组织

下一步可以先看 [快速开始](./getting-started)。
