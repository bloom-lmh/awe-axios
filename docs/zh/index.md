# Decoraxios

Decoraxios 是一套面向声明式接口层的 Axios 工具库。项目按能力拆分为核心 HTTP 装饰器、可选的 Mock 包，以及可选的 IoC / AOP 包，让你在保持主包轻量的同时，按实际需求组合功能。

## 官方站点

- 英文文档：[打开英文站点](https://awe-axios.vercel.app/)
- 中文文档：[打开中文站点](https://decoraxios-lh0tx0sk.maozi.io/)

## 包选择

| 包名 | 适用场景 |
| --- | --- |
| `decoraxios` | 你希望使用默认主包，并直接获得核心 HTTP 装饰器能力。 |
| `@decoraxios/core` | 你希望在导入和依赖声明里显式使用核心包名称。 |
| `@decoraxios/mock` | 你希望在开发或测试阶段使用基于 MSW 的装饰器式 Mock。 |
| `@decoraxios/ioc-aop` | 你需要依赖注入和切面编程能力。 |
| `@decoraxios/all` | 你希望通过一个包导入全部公开装饰器。 |

## 文档结构

- [快速开始](./getting-started.md)
- [HTTP 装饰器](./core.md)
- [运行时装饰器](./extensions.md)
- [Mock](./mock.md)
- [IoC / AOP](./ioc-aop.md)

## 设计原则

- 被装饰的 HTTP 方法是声明，而不是手写请求逻辑。
- 主包保持轻量，只暴露核心 HTTP 能力。
- Mock 与 IoC / AOP 都是按需增强，不会默认给普通项目带来额外运行时依赖。
- 所有请求入口都围绕 `ApiCall<TResponse, TRequest>` 维持清晰的类型边界。
