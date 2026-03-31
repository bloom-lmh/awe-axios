# Decoraxios

Decoraxios is a decorator-first HTTP toolkit built on top of Axios. It keeps API declarations class-based and typed, adds opt-in MSW mocking, and provides a lightweight IoC/AOP layer for teams that want class-level composition without pulling in a large framework.

## Official docs

- English docs: [Open the English site](https://awe-axios.vercel.app/)
- Chinese docs: [Open the Chinese site](https://decoraxios-lh0tx0sk.maozi.io/)

## Packages

| Package | Purpose |
| --- | --- |
| `decoraxios` | Recommended root package. Re-exports the core HTTP decorator surface. |
| `@decoraxios/core` | Explicit core package with HTTP decorators, parameter decorators, and runtime decorators. |
| `@decoraxios/mock` | MSW-powered mock decorators and `MockAPI`. |
| `@decoraxios/mock-ws` | Standalone MSW-powered WebSocket mocking with decorators and raw handlers. |
| `@decoraxios/ioc-aop` | IoC container, dependency injection, and AOP decorators. |
| `@decoraxios/all` | Full bundle that re-exports the public APIs from every package. |

## Installation

Install only the packages you need:

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

If you use `@decoraxios/ioc-aop` or `@decoraxios/all`, load `reflect-metadata` once at your application entry:

```ts
import 'reflect-metadata';
```

## TypeScript setup

Decoraxios uses legacy TypeScript decorators:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

`emitDecoratorMetadata` is required when you want `@Inject()` to resolve dependencies from reflected property types.

## Quick example

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

## What is covered

- HTTP declaration: `@HttpApi`, `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`
- Parameter binding: `@PathParam`, `@QueryParam`, `@BodyParam`
- Runtime configuration: `@RefAxios`, `@AxiosRef`, `@TransformRequest`, `@TransformResponse`
- Runtime strategies: `@Retry`, `@Debounce`, `@Throttle`
- Mocking: `@Mock`, `MockAPI`, `@WebSocketMock`, `@WebSocketState`, `@OnConnection`, `@OnClientMessage`, `@WsMessageType`, `@WsGuard`, `@WsJsonGuard`, `@WsJsonMatch`, `@WsJsonPath`, `@WsNamespace`, `@WsAck`, `@WsError`, `@WsJsonData`, `@WsPathParam`, `@WsState`, `@WsPatchState`, `@WsSendJson`, `MockWebSocketAPI`, `ws`
- IoC and AOP: `@Component`, `@Inject`, `@Aspect`, `@Before`, `@After`, `@Around`, `@AfterReturning`, `@AfterThrowing`

## Workspace examples

- [HTTP mock basics](./examples/mock-basic.ts)
- [WebSocket protocol mock](./examples/mock-ws-protocol.ts)
- [Umbrella imports](./examples/umbrella-imports.ts)

## Documentation map

- [English overview](./docs/en/index.md)
- [English getting started](./docs/en/getting-started.md)
- [English HTTP decorators](./docs/en/core.md)
- [English runtime decorators](./docs/en/extensions.md)
- [English HTTP mock guide](./docs/en/mock.md)
- [English WebSocket mock guide](./docs/en/mock-ws.md)
- [English IoC and AOP guide](./docs/en/ioc-aop.md)
- [中文总览](./docs/zh/index.md)
- [中文快速开始](./docs/zh/getting-started.md)
- [中文 HTTP 装饰器](./docs/zh/core.md)
- [中文运行时装饰器](./docs/zh/extensions.md)
- [中文 HTTP Mock 指南](./docs/zh/mock.md)
- [中文 WebSocket Mock 指南](./docs/zh/mock-ws.md)
- [中文 IoC / AOP 指南](./docs/zh/ioc-aop.md)

## Development

```bash
npm install
npm run build
npm test
npm run docs:dev
```
