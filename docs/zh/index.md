# 概览

Awe Axios 是一个构建在 Axios 之上的装饰器风格工具集。它的目标不是把 HTTP、mock、IoC、AOP 强行绑成一个大包，而是让你按项目需要组合能力。

## 当前架构的核心变化

现在的 monorepo 采用了更明确的 core-first 设计：

- `awe-axios` 是轻量根入口，只代表核心 HTTP 能力。
- `@decoraxios/awe-axios-core` 是显式的 scoped core 包。
- `@decoraxios/awe-axios-mock` 提供基于 MSW 的 mock。
- `@decoraxios/awe-axios-ioc-aop` 提供依赖注入和切面能力。
- `@decoraxios/awe-axios-all` 是显式的 full bundle，用于“一次安装拿全套”。

这次重构主要解决了两个长期问题：

- 用短包名安装时，不会再把 mock / IoC / AOP 依赖偷偷一起带进来。
- mock 请求和真实请求终于拥有了统一的方法调用方式和返回类型。

## 为什么这种拆分更适合真实项目

### 装饰器代码更接近业务

你可以把接口定义写成类和方法，而不是到处散落请求构造逻辑。

```ts
import { type ApiCall, Get, HttpApi, PathParam } from 'awe-axios';

interface User {
  id: string;
  name: string;
}

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<User> {
    return undefined as never;
  }
}
```

### TypeScript 提示更稳定

`ApiCall<T>` 会把真实返回类型固定成：

```ts
type ApiCall<T> = Promise<AxiosResponse<T>>
```

### 运行时能力是按需的

你可以先只使用核心 HTTP 层，后面再按需要引入 mock 或 AOP，而不是一开始就背上所有依赖。

## 推荐起点

| 需求 | 推荐包 |
| --- | --- |
| 只要核心 HTTP，而且想用短包名 | `awe-axios` |
| 只要核心 HTTP，而且更喜欢 scoped import | `@decoraxios/awe-axios-core` |
| 核心 HTTP + mock | `@decoraxios/awe-axios-core` + `@decoraxios/awe-axios-mock` |
| 核心 HTTP + IoC/AOP | `@decoraxios/awe-axios-core` + `@decoraxios/awe-axios-ioc-aop` |
| 一次拿全套 | `@decoraxios/awe-axios-all` |

## 文档导览

- 从 [快速开始](./getting-started) 开始，先跑通第一个例子。
- 看 [包选择](./packages) 判断项目该装哪一个包。
- 看 [Core HTTP](./core) 了解装饰器、策略、transform 和自定义扩展。
- 看 [Mock](./mock) 学习 MSW 集成方式。
- 看 [IoC / AOP](./ioc-aop) 了解组件、注入和切面。
- 看 [Recipes](./recipes) 获取常见落地方案。
- 看 [迁移指南](./migration) 处理从旧结构到新结构的迁移。
