# @decoraxios/core

`@decoraxios/core` is the explicit core package for Decoraxios. It provides the HTTP declaration decorators, parameter decorators, runtime decorators, and typed `ApiCall<TResponse, TRequest>` return shape.

## Install

```bash
npm install @decoraxios/core axios
```

## Includes

- `@HttpApi`
- `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`
- `@PathParam`, `@QueryParam`, `@BodyParam`
- `@RefAxios`, `@AxiosRef`
- `@TransformRequest`, `@TransformResponse`
- `@Retry`, `@Debounce`, `@Throttle`

## Example

```ts
import { type ApiCall, Get, HttpApi, PathParam, Retry } from '@decoraxios/core';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  @Retry({ count: 3, delay: 200 })
  getUser(@PathParam('id') id: string): ApiCall<{ id: string; name: string }> {
    return undefined as never;
  }
}
```

## Documentation

- English guide: <https://github.com/bloom-lmh/awe-axios/blob/master/docs/en/core.md>
- English runtime decorators: <https://github.com/bloom-lmh/awe-axios/blob/master/docs/en/extensions.md>
- 中文 HTTP 装饰器文档: <https://github.com/bloom-lmh/awe-axios/blob/master/docs/zh/core.md>
- 中文运行时装饰器文档: <https://github.com/bloom-lmh/awe-axios/blob/master/docs/zh/extensions.md>
