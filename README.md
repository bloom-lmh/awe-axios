# Awe Axios

Awe Axios is a decorator-first Axios toolkit rebuilt as a workspace monorepo. It keeps the HTTP API definition experience lightweight, while making `mock`, `ioc`, and `aop` opt-in packages instead of one tightly coupled runtime.

[中文说明](./README_CH.md)

## Packages

| Package | Purpose |
| --- | --- |
| `awe-axios` | Umbrella package that re-exports everything |
| `@awe-axios/core` | HTTP decorators, parameter decorators, request helpers, and typed runtime |
| `@awe-axios/mock` | MSW-powered mock decorators and `MockAPI` |
| `@awe-axios/ioc-aop` | Lightweight IoC container, `@Inject`, and AOP decorators |

## Install

Install only what you need:

```bash
npm install @awe-axios/core axios
```

```bash
npm install @awe-axios/core @awe-axios/mock axios msw
```

```bash
npm install awe-axios axios msw reflect-metadata
```

For `@awe-axios/ioc-aop`, make sure `reflect-metadata` is loaded once in your app entry:

```ts
import 'reflect-metadata';
```

## TypeScript setup

Enable decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Core example

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
} from '@awe-axios/core';

interface User {
  id: string;
  name: string;
}

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  getUser(
    @PathParam('id') id: string,
    @QueryParam('expand') expand?: 'profile' | 'teams',
  ): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: Pick<User, 'name'>): ApiCall<User> {
    return undefined as never;
  }
}

const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

## Mock example

```ts
import { Get, HttpApi, type ApiCall } from '@awe-axios/core';
import { HttpResponse, Mock, MockAPI } from '@awe-axios/mock';

await MockAPI.on();

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
    empty: () => HttpResponse.json([]),
  })
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

MockAPI.useNextHandler('empty');
const { data } = await new UserApi().listUsers();
```

The call signature stays consistent: mocked and real requests both return `Promise<AxiosResponse<T>>`.

## IoC and AOP example

```ts
import 'reflect-metadata';

import {
  AdviceChain,
  After,
  Around,
  Aspect,
  AspectContext,
  Before,
  Component,
  Inject,
} from '@awe-axios/ioc-aop';

@Component()
class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

@Aspect(1)
class AuditAspect {
  @Before('UserService.save')
  beforeSave() {
    console.log('before save');
  }

  @Around('UserService.save')
  aroundSave(context: AspectContext, chain: AdviceChain) {
    console.log('around before');
    const result = chain.proceed(context);
    console.log('around after');
    return result;
  }

  @After('UserService.save')
  afterSave() {
    console.log('after save');
  }
}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;

  save() {
    this.logger.log('saved');
    return 'ok';
  }
}
```

## Workspace commands

```bash
npm install
npm run build
npm test
npm run docs:dev
```

## What changed in this rebuild

- The project is now an npm workspaces monorepo.
- The HTTP runtime is simpler and more type-friendly.
- Mock requests no longer switch to a double-call API.
- IoC and AOP are decoupled from the HTTP package.
- Tests now cover `core`, `mock`, and `ioc-aop` separately.
