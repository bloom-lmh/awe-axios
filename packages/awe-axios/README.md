# awe-axios

Umbrella package for the `awe-axios` monorepo.

This package re-exports the workspace modules and also exposes subpath entry points for selective installs:

- `awe-axios/core`
- `awe-axios/mock`
- `awe-axios/ioc-aop`
- `awe-axios/all`

## Install

```bash
npm install awe-axios @awe-axios/core axios
```

Install optional peers only when you need them:

```bash
npm install msw reflect-metadata
```

## Quick Example

```ts
import { type ApiCall, Get, HttpApi } from 'awe-axios/core';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}
```

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
