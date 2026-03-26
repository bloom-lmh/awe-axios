# Core

`@awe-axios/core` is the package most projects should start with.

## Key ideas

- Class decorators define shared HTTP defaults.
- Method decorators define request method and request-specific config.
- Parameter decorators map arguments into path params, query params, and body data.
- The request method stays a normal async method signature from the caller's perspective.

## Typed method pattern

```ts
import { type ApiCall, Get, HttpApi } from '@awe-axios/core';

interface Team {
  id: string;
  name: string;
}

@HttpApi('https://api.example.com/teams')
class TeamApi {
  @Get('/')
  listTeams(): ApiCall<Team[]> {
    return undefined as never;
  }
}
```

## Custom decorators

Use `withHttpMethodConfig` to build your own wrappers:

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

## Runtime helpers

`useRetry`, `useDebounce`, and `useThrottle` are generic async wrappers, so they can be reused outside of decorator-based requests too.

## Strategy decorators

If you prefer to stay fully decorator-driven, use the built-in strategy decorators:

```ts
import { type ApiCall, Debounce, Get, HttpApi, QueryParam, Retry, Throttle } from '@awe-axios/core';

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
