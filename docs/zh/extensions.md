# 运行时装饰器

这一页覆盖运行时和配置相关装饰器：

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

当类中的大多数方法都应该共用同一个 axios 实例时，优先使用它。

## `@AxiosRef`

`@AxiosRef(instance)` 用于为单个方法绑定 axios 实例。

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

`@TransformRequest(transformer)` 用于追加 axios 请求转换器。

支持两种形式：

- 单个转换函数
- 转换函数数组

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

数组形式：

```ts
@TransformRequest([
  data => JSON.stringify(data),
  data => data,
])
```

请求转换器会追加在 axios 实例默认转换器和类级转换器之后。

## `@TransformResponse`

`@TransformResponse(transformer)` 用于追加 axios 响应转换器。

支持两种形式：

- 单个转换函数
- 转换函数数组

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

它与 `@TransformRequest` 一样，按声明顺序依次追加。

## `@Retry`

`@Retry(options)` 用于在执行器抛错或拒绝时自动重试。

可用选项：

- `count`：最大执行次数，默认 `3`
- `delay`：每次重试之间的等待时间，单位毫秒，默认 `100`
- `signal`：中断重试流程的 `AbortSignal`
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

当你只希望对网络错误或 `5xx` 错误进行重试时，建议通过 `shouldRetry` 做精确控制。

## `@Debounce`

`@Debounce(options)` 用于把短时间内的重复调用合并成一次执行。

可用选项：

- `delay`：防抖窗口时长，单位毫秒，默认 `100`
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

多个调用落在同一个防抖窗口内时，会共享同一个最终结果。

立即执行模式：

```ts
@Debounce({ delay: 300, immediate: true })
```

适合首个输入立即响应、后续快速输入再合并的场景。

## `@Throttle`

`@Throttle(options)` 用于限制执行频率。

可用选项：

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

如果一个执行周期还没结束又来了更多调用，Decoraxios 会保留最后一次尾部调用，并在间隔结束后再执行一次。

## 底层配置装饰器

下面这些装饰器适合做二次封装。

### `withHttpClassConfig`

`withHttpClassConfig(config)` 用于在类级追加共享 HTTP 配置。

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

### `withHttpMethodConfig`

`withHttpMethodConfig(config)` 用于在方法级追加请求配置。

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

### `withHttpClassPlugins`

`withHttpClassPlugins(...plugins)` 用于在类级追加运行时插件。

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

### `withHttpMethodPlugins`

`withHttpMethodPlugins(...plugins)` 用于给单个方法追加运行时插件。

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

## 自定义装饰器封装

这些底层装饰器非常适合封装项目自己的规范：

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

这样你就可以把内容类型、认证头、追踪字段这类团队约定集中维护在一个地方。
