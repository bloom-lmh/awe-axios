# decoraxios

`decoraxios` is the recommended root package for Decoraxios. It re-exports the same core HTTP decorator surface as `@decoraxios/core`, while keeping mock and IoC/AOP out of the default install path.

## Install

```bash
npm install decoraxios axios
```

Add optional capabilities only when needed:

```bash
npm install decoraxios @decoraxios/mock axios msw
```

```bash
npm install decoraxios @decoraxios/ioc-aop axios reflect-metadata
```

## Example

```ts
import { type ApiCall, Get, HttpApi, PathParam } from 'decoraxios';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<{ id: string; name: string }> {
    return undefined as never;
  }
}
```

## Documentation

- English getting started: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/en/getting-started.md>
- English HTTP decorators: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/en/core.md>
- 中文快速开始: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/zh/getting-started.md>
- 中文 HTTP 装饰器文档: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/zh/core.md>
