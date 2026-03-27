# Decoraxios

Decoraxios 是一套基于 Axios 的装饰器优先 HTTP 工具库。它把请求声明、Mock、IoC 和 AOP 按能力拆成独立包，使用时可以按需安装，保持主包轻量，同时又能覆盖真实项目里常见的请求封装场景。

[English README](./README.md)

## 包结构

| 包名 | 作用 |
| --- | --- |
| `decoraxios` | 推荐主包，直接导出核心 HTTP 装饰器。 |
| `@decoraxios/core` | 显式核心包，包含 HTTP 装饰器、参数装饰器和运行时装饰器。 |
| `@decoraxios/mock` | 基于 MSW 的 Mock 装饰器与 `MockAPI`。 |
| `@decoraxios/ioc-aop` | 依赖注入、组件注册和切面装饰器。 |
| `@decoraxios/all` | 全量聚合包，统一导出 core、mock 和 ioc-aop。 |

## 安装

按需求安装对应能力即可。

```bash
npm install decoraxios axios
```

```bash
npm install decoraxios @decoraxios/mock axios msw
```

```bash
npm install decoraxios @decoraxios/ioc-aop axios reflect-metadata
```

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

如果使用 `@decoraxios/ioc-aop` 或 `@decoraxios/all`，需要在应用入口只加载一次 `reflect-metadata`：

```ts
import 'reflect-metadata';
```

## TypeScript 配置

在 `tsconfig.json` 中开启装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

如果你要让 `@Inject()` 通过属性类型自动推断依赖，`emitDecoratorMetadata` 是必须的。

## 快速开始

Decoraxios 里的 HTTP 方法本质上是“声明式接口”，真正的请求由装饰器组合生成，因此方法体通常直接写成 `return undefined as never;`。

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
  Retry,
} from 'decoraxios';

interface User {
  id: string;
  name: string;
}

interface CreateUserInput {
  name: string;
}

@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/users',
  timeout: 5000,
})
class UserApi {
  @Get('/:id')
  @Retry({ count: 3, delay: 200 })
  getUser(
    @PathParam('id') id: string,
    @QueryParam('include') include?: 'profile' | 'teams',
  ): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
    return undefined as never;
  }
}

const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

## 覆盖的装饰器能力

- HTTP 声明：`@HttpApi`、`@Get`、`@Post`、`@Put`、`@Delete`、`@Patch`、`@Options`、`@Head`
- 参数绑定：`@PathParam`、`@QueryParam`、`@BodyParam`
- 请求配置：`@RefAxios`、`@AxiosRef`、`@TransformRequest`、`@TransformResponse`
- 运行时策略：`@Retry`、`@Debounce`、`@Throttle`
- Mock：`@Mock`、`MockAPI`
- IoC / AOP：`@Component`、`@Inject`、`@Aspect`、`@Before`、`@After`、`@Around`、`@AfterReturning`、`@AfterThrowing`

## 文档入口

更完整的装饰器说明和配置示例在 `docs/` 中：

- [English getting started](./docs/en/getting-started.md)
- [English HTTP decorators](./docs/en/core.md)
- [English runtime decorators](./docs/en/extensions.md)
- [English mock guide](./docs/en/mock.md)
- [English IoC and AOP guide](./docs/en/ioc-aop.md)
- [中文快速开始](./docs/zh/getting-started.md)
- [中文 HTTP 装饰器](./docs/zh/core.md)
- [中文运行时装饰器](./docs/zh/extensions.md)
- [中文 Mock 指南](./docs/zh/mock.md)
- [中文 IoC / AOP 指南](./docs/zh/ioc-aop.md)

## 本地开发

```bash
npm install
npm run build
npm test
npm run docs:dev
```
