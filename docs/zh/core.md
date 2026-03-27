# Core HTTP

core 包是整个体系的中心。请求装饰器、参数绑定、transform、策略插件都在这里。

## 导入方式

下面两种写法是等价的：

```ts
import { Get, HttpApi, QueryParam } from 'awe-axios';
```

```ts
import { Get, HttpApi, QueryParam } from '@awe-axios/core';
```

## 装饰器模型

整个 API 可以分成三层理解。

### 类装饰器

负责定义整类共享的默认配置：

- `@HttpApi(...)`
- `@RefAxios(...)`
- `withHttpClassConfig(...)`
- `withHttpClassPlugins(...)`

### 方法装饰器

负责定义具体请求本身：

- `@Get`、`@Post`、`@Put`、`@Delete`、`@Patch`、`@Options`、`@Head`
- `@AxiosRef(...)`
- `@TransformRequest(...)`
- `@TransformResponse(...)`
- `@Retry(...)`、`@Debounce(...)`、`@Throttle(...)`
- `withHttpMethodConfig(...)`
- `withHttpMethodPlugins(...)`

### 参数装饰器

负责把方法参数映射到请求里：

- `@PathParam(...)`
- `@QueryParam(...)`
- `@BodyParam(...)`

## 一个完整例子

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

## 请求策略装饰器

core 运行时内置了三类常用策略。

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

如果你想在装饰器之外复用同样的逻辑，还可以直接使用：

- `useRetry`
- `useDebounce`
- `useThrottle`
- `createRetryPlugin`
- `createDebouncePlugin`
- `createThrottlePlugin`

## 请求与响应转换

不想写自定义 adapter 时，可以先用 transform：

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

## 自定义装饰器

如果你想给团队封装一套自己的语义层，`withHttpMethodConfig(...)` 是最直接的入口。

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

## URL 规则要记住

- 如果方法用的是相对路径，就必须有类级别绝对 `@HttpApi(...)`，或者 axios 实例上有 `baseURL`
- path 参数会先被展开
- query 参数会合并到 axios 的 `params`

::: warning
如果你写了相对路径，但没有提供 `baseURL`，运行时会在真正发请求前直接抛错。
:::

## 什么场景只用 core 就够了

只在这些场景里，core 通常就已经足够：

- 项目只需要类型友好的 HTTP 声明
- mock 由别的层负责
- 依赖注入已经由其他框架处理

如果你的项目符合这些条件，`awe-axios` 或 `@awe-axios/core` 通常就是长期最稳的选择。
