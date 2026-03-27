# Runtime Decorators

This page covers the core runtime and configuration decorators:

- `@RefAxios`
- `@AxiosRef`
- `@TransformRequest`
- `@TransformResponse`
- `@Retry`
- `@Debounce`
- `@Throttle`
- `withHttpClassConfig`
- `withHttpMethodConfig`
- `withHttpClassPlugins`
- `withHttpMethodPlugins`

## `@RefAxios`

`@RefAxios(instance)` binds an axios instance at the class level.

```ts
import axios from 'axios';
import { Get, HttpApi, RefAxios } from 'decoraxios';

const request = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

@RefAxios(request)
@HttpApi('/users')
class UserApi {
  @Get('/')
  listUsers() {
    return undefined as never;
  }
}
```

Use it when most methods in the class should use the same axios instance.

## `@AxiosRef`

`@AxiosRef(instance)` binds an axios instance for one method only.

```ts
import axios from 'axios';
import { AxiosRef, Get, HttpApi, RefAxios } from 'decoraxios';

const primary = axios.create({ baseURL: 'https://api.example.com' });
const backup = axios.create({ baseURL: 'https://backup.example.com' });

@RefAxios(primary)
@HttpApi('/users')
class UserApi {
  @Get('/')
  listUsers() {
    return undefined as never;
  }

  @Get('/health')
  @AxiosRef(backup)
  health() {
    return undefined as never;
  }
}
```

Method-level `@AxiosRef` overrides class-level `@RefAxios`.

## `@TransformRequest`

`@TransformRequest` appends one or more axios request transformers.

```ts
import { BodyParam, Post, TransformRequest } from 'decoraxios';

class UserApi {
  @Post('/users')
  @TransformRequest(data => JSON.stringify({ ...data, source: 'admin' }))
  createUser(@BodyParam() payload: { name: string }) {
    return undefined as never;
  }
}
```

You can also pass an array:

```ts
@TransformRequest([
  data => JSON.stringify(data),
  data => data,
])
```

## `@TransformResponse`

`@TransformResponse` appends one or more axios response transformers.

```ts
import { Get, TransformResponse } from 'decoraxios';

class MetricsApi {
  @Get('/metrics')
  @TransformResponse(data => ({
    ...data,
    loadedAt: Date.now(),
  }))
  metrics() {
    return undefined as never;
  }
}
```

Like `@TransformRequest`, it accepts a single function or an array.

## `@Retry`

`@Retry(options)` retries the decorated request when the wrapped executor throws.

Available options:

- `count`: maximum attempts, default `3`
- `delay`: delay between attempts in milliseconds, default `100`
- `signal`: abort signal for stopping retries
- `shouldRetry(error, attempt)`: custom retry predicate

```ts
import { Get, Retry } from 'decoraxios';

class HealthApi {
  @Get('/health')
  @Retry({
    count: 5,
    delay: 300,
    shouldRetry: (_error, attempt) => attempt < 5,
  })
  health() {
    return undefined as never;
  }
}
```

## `@Debounce`

`@Debounce(options)` coalesces rapid repeated calls into one execution.

Available options:

- `delay`: debounce window in milliseconds, default `100`
- `immediate`: run the first call immediately, default `false`

```ts
import { Debounce, Get, QueryParam } from 'decoraxios';

class SearchApi {
  @Get('/search')
  @Debounce({ delay: 250 })
  search(@QueryParam('q') keyword: string) {
    return undefined as never;
  }
}
```

When multiple callers enter the debounce window, they receive the same eventual result.

## `@Throttle`

`@Throttle(options)` limits request execution frequency.

Available options:

- `interval`: throttle interval in milliseconds, default `100`

```ts
import { Get, Throttle } from 'decoraxios';

class MetricsApi {
  @Get('/metrics')
  @Throttle({ interval: 500 })
  metrics() {
    return undefined as never;
  }
}
```

If calls arrive while one run is active, Decoraxios keeps the latest trailing call and executes it after the interval.

## `withHttpClassConfig`

`withHttpClassConfig(config)` is the low-level class decorator for applying shared HTTP config without introducing a higher-level convenience decorator.

```ts
import { HttpApi, withHttpClassConfig } from 'decoraxios';

@HttpApi('/users')
@withHttpClassConfig({
  timeout: 3000,
  headers: {
    'X-App': 'admin-console',
  },
})
class UserApi {}
```

Use this when you want to compose your own class decorators around Decoraxios.

## `withHttpMethodConfig`

`withHttpMethodConfig(config)` is the low-level method decorator for appending request config.

```ts
import { Get, withHttpMethodConfig } from 'decoraxios';

class UserApi {
  @Get('/:id')
  @withHttpMethodConfig({
    timeout: 1200,
    headers: {
      'X-Trace': 'user-detail',
    },
  })
  getUser() {
    return undefined as never;
  }
}
```

## `withHttpClassPlugins`

`withHttpClassPlugins(...plugins)` appends runtime plugins at the class level.

```ts
import { HttpApi, type HttpRuntimePlugin, withHttpClassPlugins } from 'decoraxios';

const tracePlugin: HttpRuntimePlugin = (next, context) => async config => {
  return next({
    ...config,
    headers: {
      ...(config.headers ?? {}),
      'x-method-id': context.methodId,
    },
  });
};

@HttpApi('https://api.example.com')
@withHttpClassPlugins(tracePlugin)
class UserApi {}
```

## `withHttpMethodPlugins`

`withHttpMethodPlugins(...plugins)` appends runtime plugins for one method.

```ts
import { Get, type HttpRuntimePlugin, withHttpMethodPlugins } from 'decoraxios';

const forceJsonPlugin: HttpRuntimePlugin = next => async config => {
  return next({
    ...config,
    headers: {
      ...(config.headers ?? {}),
      Accept: 'application/json',
    },
  });
};

class UserApi {
  @Get('/users')
  @withHttpMethodPlugins(forceJsonPlugin)
  listUsers() {
    return undefined as never;
  }
}
```

## Advanced composition pattern

The low-level decorators make it easy to build your own opinionated wrappers:

```ts
import { Post, withHttpMethodConfig } from 'decoraxios';

function JsonPost(url: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Post(url)(target, propertyKey, descriptor);
    withHttpMethodConfig({
      headers: {
        'Content-Type': 'application/json',
      },
    })(target, propertyKey);
  };
}
```

That keeps project-specific conventions in one place while still using the Decoraxios runtime.
