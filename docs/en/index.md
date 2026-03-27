# Overview

Awe Axios is a decorator-first toolkit built on top of Axios. It keeps API client declarations close to application code while still letting you split runtime features into separate packages.

## What changed in the current architecture

The current monorepo is intentionally core-first:

- `awe-axios` is the lightweight entry and maps to the core HTTP decorators.
- `@awe-axios/core` is the explicit core package if you prefer fully scoped imports.
- `@awe-axios/mock` adds MSW-backed mocking.
- `@awe-axios/ioc-aop` adds dependency injection and aspect weaving.
- `@awe-axios/all` is the explicit full bundle when you want one package that re-exports everything.

This solves the two biggest problems from the older design:

- Installing the short package name no longer pulls mock or IoC/AOP dependencies by surprise.
- Real requests and mocked requests now share the same method shape and return type.

## Why teams use it

### Decorators stay readable

You describe an API with class, method, and parameter decorators instead of hand-writing request builders everywhere.

```ts
import { type ApiCall, Get, HttpApi, PathParam } from 'awe-axios';

interface User {
  id: string;
  name: string;
}

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<User> {
    return undefined as never;
  }
}
```

### TypeScript stays predictable

`ApiCall<T>` keeps method signatures short while preserving the actual runtime shape:

```ts
type ApiCall<T> = Promise<AxiosResponse<T>>
```

### Features stay optional

You can start with the HTTP layer only, then add mocking or AOP later without changing the whole project structure.

## Recommended starting points

Choose one of these depending on the kind of project you are building:

| Need | Recommended package |
| --- | --- |
| Short package name, core HTTP only | `awe-axios` |
| Explicit scoped core package | `@awe-axios/core` |
| Core + MSW mocking | `@awe-axios/core` + `@awe-axios/mock` |
| Core + IoC/AOP | `@awe-axios/core` + `@awe-axios/ioc-aop` |
| Single full bundle | `@awe-axios/all` |

## Documentation map

- Start with [Getting Started](./getting-started) if you want the first runnable example.
- Read [Package Selection](./packages) if you are deciding which package to install.
- Read [Core HTTP](./core) for decorators, strategies, transforms, and custom axios instances.
- Read [Mock](./mock) for MSW integration.
- Read [IoC and AOP](./ioc-aop) for components, injection, and aspects.
- Read [Recipes](./recipes) for practical patterns.
- Read [Migration Guide](./migration) if you are upgrading from the previous single-package design.
