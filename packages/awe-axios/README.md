# awe-axios

Core-first package for the `awe-axios` monorepo.

`awe-axios` now maps to the same HTTP decorator surface as `@awe-axios/core`, so you can keep the short package name without pulling in mock or IoC/AOP dependencies.

If you want the full bundle, install `@awe-axios/all` instead.

## Install

```bash
npm install awe-axios axios
```

For the full bundle:

```bash
npm install @awe-axios/all axios msw reflect-metadata
```

## Quick Example

```ts
import { type ApiCall, Get, HttpApi } from 'awe-axios';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}
```

The `awe-axios/core` subpath remains available as a compatibility alias.

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
