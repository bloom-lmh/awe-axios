# Decoraxios

Decoraxios 是一套基于 Axios 的装饰器优先 HTTP 工具库。它把请求声明保持为类和方法的形式，在核心包之外按需提供 MSW Mock 与 IoC / AOP 能力，适合想要声明式接口层、又不希望引入重型框架的项目。

[English README](./README.md)

## 官方文档

- 英文文档：[打开英文站点](https://awe-axios.vercel.app/)
- 中文文档：[打开中文站点](https://decoraxios-lh0tx0sk.maozi.io/)

## 包结构

| 包名 | 作用 |
| --- | --- |
| `decoraxios` | 推荐主包，直接导出核心 HTTP 装饰器能力。 |
| `@decoraxios/core` | 显式核心包，包含 HTTP 装饰器、参数装饰器和运行时装饰器。 |
| `@decoraxios/mock` | 基于 MSW 的 Mock 装饰器与 `MockAPI`。 |
| `@decoraxios/mock-ws` | 独立的基于 MSW 的 WebSocket Mock 工具包，支持装饰器和原生 handlers。 |
| `@decoraxios/ioc-aop` | IoC 容器、依赖注入和切面装饰器。 |
| `@decoraxios/all` | 全量聚合包，统一导出各个子包的公开 API。 |

## 安装

按需要安装对应功能即可：

```bash
npm install decoraxios axios
```

```bash
npm install decoraxios @decoraxios/mock axios msw
```

```bash
npm install @decoraxios/mock-ws msw
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

Decoraxios 依赖 TypeScript 传统装饰器语法：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

当你希望 `@Inject()` 依据属性类型自动解析依赖时，`emitDecoratorMetadata` 是必须的。

## 快速示例

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

## 能力范围

- HTTP 声明：`@HttpApi`、`@Get`、`@Post`、`@Put`、`@Delete`、`@Patch`、`@Options`、`@Head`
- 参数绑定：`@PathParam`、`@QueryParam`、`@BodyParam`
- 运行时配置：`@RefAxios`、`@AxiosRef`、`@TransformRequest`、`@TransformResponse`
- 运行时策略：`@Retry`、`@Debounce`、`@Throttle`
- Mock：`@Mock`、`MockAPI`、`@WebSocketMock`、`@OnConnection`、`@OnClientMessage`、`MockWebSocketAPI`、`ws`
- IoC / AOP：`@Component`、`@Inject`、`@Aspect`、`@Before`、`@After`、`@Around`、`@AfterReturning`、`@AfterThrowing`

## 文档导航

- [英文总览](./docs/en/index.md)
- [英文快速开始](./docs/en/getting-started.md)
- [英文 HTTP 装饰器](./docs/en/core.md)
- [英文运行时装饰器](./docs/en/extensions.md)
- [英文 HTTP Mock 指南](./docs/en/mock.md)
- [英文 WebSocket Mock 指南](./docs/en/mock-ws.md)
- [英文 IoC / AOP 指南](./docs/en/ioc-aop.md)
- [中文总览](./docs/zh/index.md)
- [中文快速开始](./docs/zh/getting-started.md)
- [中文 HTTP 装饰器](./docs/zh/core.md)
- [中文运行时装饰器](./docs/zh/extensions.md)
- [中文 HTTP Mock 指南](./docs/zh/mock.md)
- [中文 WebSocket Mock 指南](./docs/zh/mock-ws.md)
- [中文 IoC / AOP 指南](./docs/zh/ioc-aop.md)

## 本地开发

```bash
npm install
npm run build
npm test
npm run docs:dev
```
