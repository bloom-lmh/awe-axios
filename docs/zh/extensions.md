# 运行时装饰器

这一页覆盖 Decoraxios 的运行时与配置装饰器：

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

`@RefAxios(instance)` 用于在类级绑定 axios 实例。

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

当一个类里的大部分方法都需要共用同一个 axios 实例时，这个装饰器最合适。

## `@AxiosRef`

`@AxiosRef(instance)` 只对单个方法绑定 axios 实例。

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

方法级 `@AxiosRef` 会覆盖类级 `@RefAxios`。

## `@TransformRequest`

`@TransformRequest` 用于追加一个或多个 axios 请求转换器。

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

它也支持数组形式：

```ts
@TransformRequest([
  data => JSON.stringify(data),
  data => data,
])
```

## `@TransformResponse`

`@TransformResponse` 用于追加一个或多个 axios 响应转换器。

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

同样支持单函数或数组。

## `@Retry`

`@Retry(options)` 会在请求抛错时自动重试。

可用配置：

- `count`：最大尝试次数，默认 `3`
- `delay`：两次重试之间的间隔，单位毫秒，默认 `100`
- `signal`：用于中断重试过程的 `AbortSignal`
- `shouldRetry(error, attempt)`：自定义是否继续重试

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

`@Debounce(options)` 会把短时间内的高频调用合并成一次执行。

可用配置：

- `delay`：防抖窗口，单位毫秒，默认 `100`
- `immediate`：是否立即执行第一次调用，默认 `false`

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

在同一个防抖窗口内进入的调用，会共享最终的返回结果。

## `@Throttle`

`@Throttle(options)` 用于限制请求触发频率。

可用配置：

- `interval`：节流间隔，单位毫秒，默认 `100`

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

如果节流窗口内又来了新调用，Decoraxios 会保留最新那次 trailing 调用，在间隔结束后再执行。

## `withHttpClassConfig`

`withHttpClassConfig(config)` 是最底层的类装饰器，用来追加类级 HTTP 配置。

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

适合你在项目里继续封装自己的类级装饰器时使用。

## `withHttpMethodConfig`

`withHttpMethodConfig(config)` 是最底层的方法装饰器，用来给某个方法追加请求配置。

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

`withHttpClassPlugins(...plugins)` 用于在类级挂载运行时插件。

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

`withHttpMethodPlugins(...plugins)` 用于给单个方法挂载运行时插件。

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

## 项目级二次封装示例

底层装饰器可以帮助你做项目规范封装：

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

这样你可以把团队内部的请求规范统一沉淀成自己的装饰器。
