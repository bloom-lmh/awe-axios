# @decoraxios/all

`@decoraxios/all` is the full bundle package for Decoraxios. It re-exports the core HTTP decorators, the mock package, and the IoC/AOP package from one import surface.

## Install

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

## Example

```ts
import 'reflect-metadata';
import { Component, Get, HttpApi, HttpResponse, Inject, Mock, type ApiCall } from '@decoraxios/all';

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

## Documentation

- English overview: <https://github.com/bloom-lmh/decoraxios/blob/master/README.md>
- 中文说明: <https://github.com/bloom-lmh/decoraxios/blob/master/README_CH.md>
