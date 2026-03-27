# Awe Axios

Awe Axios is a decorator-first Axios toolkit rebuilt as a workspace monorepo. The package split is now intentionally sharper:

- `awe-axios` is the lightweight core-first entry.
- `@decoraxios/awe-axios-core` is the explicit core package.
- `@decoraxios/awe-axios-mock` adds MSW-powered mock support.
- `@decoraxios/awe-axios-ioc-aop` adds IoC and AOP decorators.
- `@decoraxios/awe-axios-all` is the full bundle when you want everything from one import surface.

[中文说明](./README_CH.md)

## Packages

| Package | Purpose |
| --- | --- |
| `awe-axios` | Core-first package alias for lightweight installs |
| `@decoraxios/awe-axios-core` | HTTP decorators, parameter decorators, request helpers, and typed runtime |
| `@decoraxios/awe-axios-mock` | MSW-powered mock decorators and `MockAPI` |
| `@decoraxios/awe-axios-ioc-aop` | Lightweight IoC container, `@Inject`, and AOP decorators |
| `@decoraxios/awe-axios-all` | Full bundle package that depends on `core`, `mock`, and `ioc-aop` |

## Install

Choose the distribution style that matches your app:

```bash
npm install awe-axios axios
```

```bash
npm install @decoraxios/awe-axios-core @decoraxios/awe-axios-mock axios msw
```

```bash
npm install @decoraxios/awe-axios-all axios msw reflect-metadata
```

`awe-axios` now represents the same runtime surface as `@decoraxios/awe-axios-core`, so installing it no longer drags in mock or IoC/AOP dependencies.

For `@decoraxios/awe-axios-ioc-aop` and `@decoraxios/awe-axios-all`, make sure `reflect-metadata` is loaded once in your app entry:

```ts
import 'reflect-metadata';
```

## TypeScript Setup

Enable decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Core Example

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
} from 'awe-axios';

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

## Strategy Decorators

The core runtime ships first-class request strategy decorators in addition to the plain helper functions:

```ts
import { type ApiCall, Debounce, Get, HttpApi, QueryParam, Retry, Throttle } from 'awe-axios';

@HttpApi('https://api.example.com')
class SearchApi {
  @Get('/search')
  @Debounce({ delay: 150 })
  search(@QueryParam('q') q: string): ApiCall<{ items: string[] }> {
    return undefined as never;
  }

  @Get('/health')
  @Retry({ count: 3, delay: 300 })
  health(): ApiCall<{ ok: boolean }> {
    return undefined as never;
  }

  @Get('/metrics')
  @Throttle({ interval: 200 })
  metrics(): ApiCall<{ count: number }> {
    return undefined as never;
  }
}
```

## Mock Example

```ts
import { Get, HttpApi, type ApiCall } from 'awe-axios';
import { HttpResponse, Mock, MockAPI } from '@decoraxios/awe-axios-mock';

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

## IoC And AOP Example

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
} from '@decoraxios/awe-axios-ioc-aop';

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

## Full Bundle Example

```ts
import 'reflect-metadata';
import { Component, Get, HttpApi, HttpResponse, Mock } from '@decoraxios/awe-axios-all';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
  })
  listUsers() {
    return undefined as never;
  }
}

@Component()
class LoggerService {}
```

## Import Styles

Choose the style that matches your distribution strategy:

```ts
import { Get, HttpApi } from 'awe-axios';
import { Mock } from '@decoraxios/awe-axios-mock';
import { Component } from '@decoraxios/awe-axios-ioc-aop';
```

```ts
import { Get, HttpApi, Mock, Component } from '@decoraxios/awe-axios-all';
```

## Workspace Commands

```bash
npm install
npm run build
npm test
npm run docs:dev
```

For release preparation and dry-run publishing:

```bash
npm run changeset
npm run version-packages
npm run release:check
```

## What Changed In This Rebuild

- The project is now an npm workspaces monorepo.
- `awe-axios` is now truly core-first instead of being a hidden full bundle.
- The full bundle moved into `@decoraxios/awe-axios-all`.
- Mock requests no longer switch to a double-call API.
- IoC and AOP stay optional unless you install them.

## Release Automation

GitHub Actions now ships with two workflows:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs install, build, typecheck, test, docs build, and `npm pack --dry-run`.
- [`.github/workflows/release.yml`](./.github/workflows/release.yml) uses Changesets to open or update the version PR, then publishes to npm after the version PR is merged.

The release flow is:

1. Add a changeset with `npm run changeset`.
2. Merge the feature branch into `master`.
3. The release workflow opens or updates a version PR.
4. Merge that version PR to publish the packages.

To enable npm publishing in GitHub Actions:

- Preferred: configure npm Trusted Publishing for each package and point it at `release.yml`.
- Fallback: create a repository secret named `NPM_TOKEN`.

`npm run version-packages` now refreshes `package-lock.json` after version bumps so the release PR stays consistent.

For the full release checklist and branch protection recommendations, see [RELEASING.md](./RELEASING.md).
