# @awe-axios/all

Full bundle package for the `awe-axios` monorepo.

Install this package when you want a single import surface that includes the core HTTP decorators, the MSW mock layer, and the IoC/AOP helpers.

## Install

```bash
npm install @awe-axios/all axios msw reflect-metadata
```

Load `reflect-metadata` once in your app entry before using IoC or AOP decorators:

```ts
import 'reflect-metadata';
```

## Quick Example

```ts
import { type ApiCall, Component, Get, HttpApi, HttpResponse, Inject, Mock } from '@awe-axios/all';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock(() => HttpResponse.json([]))
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

@Component()
class LoggerService {}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
