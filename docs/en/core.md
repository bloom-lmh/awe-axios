# Core HTTP

The core package is where request decorators, parameter binding, transforms, and execution plugins live.

## Import options

These two imports are equivalent:

```ts
import { Get, HttpApi, QueryParam } from 'awe-axios';
```

```ts
import { Get, HttpApi, QueryParam } from '@awe-axios/core';
```

## Decorator model

The core API is built around three layers.

### Class decorators

Use class decorators to define defaults shared by every method:

- `@HttpApi(...)`
- `@RefAxios(...)`
- `withHttpClassConfig(...)`
- `withHttpClassPlugins(...)`

### Method decorators

Use method decorators to define the request itself:

- `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`
- `@AxiosRef(...)`
- `@TransformRequest(...)`
- `@TransformResponse(...)`
- `@Retry(...)`, `@Debounce(...)`, `@Throttle(...)`
- `withHttpMethodConfig(...)`
- `withHttpMethodPlugins(...)`

### Parameter decorators

Use parameter decorators to bind method arguments:

- `@PathParam(...)`
- `@QueryParam(...)`
- `@BodyParam(...)`

## A complete example

```ts
import {
  type ApiCall,
  AxiosRef,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
  TransformResponse,
} from 'awe-axios';
import axios from 'axios';

const request = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

@HttpApi('/users')
class UserApi {
  @Get('/:id')
  @AxiosRef(request)
  @TransformResponse(data => ({
    ...data,
    loadedAt: Date.now(),
  }))
  getUser(
    @PathParam('id') id: string,
    @QueryParam('expand') expand?: 'profile' | 'teams',
  ): ApiCall<{ id: string; name: string; loadedAt: number }> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: { name: string }): ApiCall<{ id: string; name: string }> {
    return undefined as never;
  }
}
```

## Strategy decorators

The core runtime includes request strategies as first-class decorators.

### Retry

```ts
@Get('/health')
@Retry({ count: 3, delay: 300 })
health(): ApiCall<{ ok: boolean }> {
  return undefined as never;
}
```

### Debounce

```ts
@Get('/search')
@Debounce({ delay: 150 })
search(@QueryParam('q') q: string): ApiCall<{ items: string[] }> {
  return undefined as never;
}
```

### Throttle

```ts
@Get('/metrics')
@Throttle({ interval: 200 })
metrics(): ApiCall<{ count: number }> {
  return undefined as never;
}
```

The same strategy logic is also available as reusable helpers:

- `useRetry`
- `useDebounce`
- `useThrottle`
- `createRetryPlugin`
- `createDebouncePlugin`
- `createThrottlePlugin`

## Request transforms

Use transforms when you need to reshape request bodies or response payloads without building a custom adapter.

```ts
@Post('/')
@TransformRequest(data => JSON.stringify({ ...data, source: 'web' }))
createUser(@BodyParam() payload: { name: string }) {
  return undefined as never;
}
```

```ts
@Get('/stats')
@TransformResponse(data => ({ ...data, loadedAt: Date.now() }))
getStats() {
  return undefined as never;
}
```

## Custom decorators

`withHttpMethodConfig(...)` is the lowest-friction way to build your own higher-level decorators.

```ts
import { Post, type HttpMethodDecoratorConfig } from '@awe-axios/core';

export function JsonPost(config: HttpMethodDecoratorConfig) {
  return Post({
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers ?? {}),
    },
  });
}
```

## URL rules to remember

- If a method uses a relative path, it needs either a class-level absolute `@HttpApi(...)` URL or an axios instance with `baseURL`.
- Path parameters are resolved before the request runs.
- Query parameters are merged into the axios `params` object.

::: warning
If you use a relative API path without a `baseURL`, the runtime will throw before the request executes.
:::

## When to stay in core only

Core-only is enough when:

- your app only needs typed HTTP declarations
- mocking is handled elsewhere
- dependency injection is managed by another framework

If that describes your project, `awe-axios` or `@awe-axios/core` is the right long-term choice.
