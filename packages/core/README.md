# @decoraxios/awe-axios-core

Decorator-first HTTP primitives for `awe-axios`.

`@decoraxios/awe-axios-core` provides the base request decorators, parameter decorators, runtime plugins, and TypeScript-first `ApiCall<T>` signatures.

## Install

```bash
npm install @decoraxios/awe-axios-core axios
```

## Highlights

- Decorator-based HTTP client declarations
- Strong TypeScript return types
- Request strategy decorators such as `@Retry`, `@Debounce`, and `@Throttle`
- Custom axios instance binding and request/response transforms

## Quick Example

```ts
import { type ApiCall, Get, HttpApi, PathParam } from '@decoraxios/awe-axios-core';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<{ id: string; name: string }> {
    return undefined as never;
  }
}
```

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
