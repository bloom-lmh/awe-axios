# Decoraxios

Decoraxios 是一套偏工程化的 Axios 装饰器工具库，适合把接口层写成声明式类 API 的项目。仓库按能力拆成核心包、Mock 包、IoC / AOP 包，以及一个全量聚合包，方便按需选择。

## 包说明

| 包名 | 适用场景 |
| --- | --- |
| `decoraxios` | 推荐主包，只暴露核心 HTTP 装饰器能力。 |
| `@decoraxios/core` | 需要显式引用核心包时使用。 |
| `@decoraxios/mock` | 需要基于 MSW 做接口 Mock 时使用。 |
| `@decoraxios/ioc-aop` | 需要依赖注入和切面编程时使用。 |
| `@decoraxios/all` | 希望从一个包统一导入全部公开装饰器时使用。 |

## 文档结构

- [快速开始](./getting-started.md)
- [HTTP 装饰器](./core.md)
- [运行时装饰器](./extensions.md)
- [Mock](./mock.md)
- [IoC / AOP](./ioc-aop.md)

## 设计原则

- 被装饰的 HTTP 方法是声明，不负责写真实请求逻辑。
- 根包保持轻量，只提供核心 HTTP 能力。
- Mock 与 IoC / AOP 是可选增强，不会默认给普通项目引入额外依赖。
- 所有请求入口都围绕 `ApiCall<TResponse, TRequest>` 保持明确的类型约束。
