# Decoraxios

Decoraxios is a decorator-first HTTP toolkit built on top of Axios. It keeps the common request flow declarative, adds opt-in mocking with MSW, and provides a small IoC/AOP layer when you need cross-cutting behavior in class-based code.

[中文说明](./README_CH.md)

## Packages

| Package | Purpose |
| --- | --- |
| `decoraxios` | Recommended root package. Re-exports the core HTTP decorators. |
| `@decoraxios/core` | Explicit core package with HTTP decorators, parameter decorators, and runtime decorators. |
| `@decoraxios/mock` | Mock decorators and `MockAPI`, powered by MSW. |
| `@decoraxios/ioc-aop` | IoC container, dependency injection, and aspect decorators. |
| `@decoraxios/all` | Full bundle that re-exports core, mock, and IoC/AOP. |

## Install

Install only the package surface you need.

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

If you use `@decoraxios/ioc-aop` or `@decoraxios/all`, load `reflect-metadata` once at your application entry:

```ts
import 'reflect-metadata';
```

## TypeScript setup

Enable decorators in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

`emitDecoratorMetadata` is required when you want `@Inject()` to resolve dependencies from reflected property types.

## Quick start

Decorated HTTP methods are declarations, not imperative request handlers. Their bodies are usually `return undefined as never;`, and the runtime request is assembled from the decorators.

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

## What the decorators cover

- HTTP declaration: `@HttpApi`, `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`
- Parameter binding: `@PathParam`, `@QueryParam`, `@BodyParam`
- Request configuration: `@RefAxios`, `@AxiosRef`, `@TransformRequest`, `@TransformResponse`
- Runtime strategies: `@Retry`, `@Debounce`, `@Throttle`
- Mocking: `@Mock`, `MockAPI`
- IoC and AOP: `@Component`, `@Inject`, `@Aspect`, `@Before`, `@After`, `@Around`, `@AfterReturning`, `@AfterThrowing`

## Documentation

The detailed decorator reference lives in `docs/` and is split by concern:

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

## Development

```bash
npm install
npm run build
npm test
npm run docs:dev
```
