# decoraxios

Core-first package for the Decoraxios monorepo.

`decoraxios` is the recommended root package for new projects. It exposes the same HTTP decorator surface as `@decoraxios/core` without bringing in mock or IoC/AOP dependencies.

## Install

```bash
npm install decoraxios axios
```

For the full bundle:

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

## Quick Example

```ts
import { type ApiCall, Get, HttpApi } from 'decoraxios';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}
```

The `decoraxios/core` subpath remains available when you want an explicit root-to-core import.

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
