# HTTP 装饰器

这一页覆盖核心声明式 HTTP 装饰器：

- `@HttpApi`
- `@Get`
- `@Post`
- `@Put`
- `@Delete`
- `@Patch`
- `@Options`
- `@Head`
- `@PathParam`
- `@QueryParam`
- `@BodyParam`

## `@HttpApi`

`@HttpApi` 是类装饰器，用来定义共享请求配置。它支持四种写法：

- 绝对 URL 字符串
- 相对 URL 字符串
- `AxiosInstance`
- `HttpApiConfig` 对象

### 绝对 URL 字符串

当你传入绝对 URL 字符串时，Decoraxios 会把它作为 `baseURL`：

```ts
@HttpApi('https://api.example.com')
class UserApi {}
```

### 相对 URL 字符串

相对字符串会被当成类级路径前缀：

```ts
@HttpApi('/users')
class UserApi {}
```

当 axios 实例已经提供了绝对 `baseURL` 时，这种写法最常见。

### Axios 实例

直接传入 axios 实例，等价于在类级绑定 `refAxios`：

```ts
import axios from 'axios';
import { HttpApi } from 'decoraxios';

const request = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

@HttpApi(request)
class UserApi {}
```

### 配置对象

当你需要共享请求头、参数、转换器、插件或路径前缀时，使用对象形式：

```ts
@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/users',
  timeout: 5000,
  headers: {
    'X-App': 'admin-console',
  },
  params: {
    locale: 'zh-CN',
  },
})
class UserApi {}
```

### 常用 `HttpApiConfig` 字段

`HttpApiConfig` 继承自 `AxiosRequestConfig`，只是类级不允许定义 `method`。

常用字段：

- `baseURL`
- `url`
- `timeout`
- `headers`
- `params`
- `responseType`
- `transformRequest`
- `transformResponse`
- `refAxios`
- `plugins`

## HTTP 方法装饰器

Decoraxios 为每个 HTTP 动词提供一个装饰器：

- `@Get`
- `@Post`
- `@Put`
- `@Delete`
- `@Patch`
- `@Options`
- `@Head`

每个装饰器都支持两种写法：

- 字符串简写，直接视为 `url`
- 完整的 `HttpMethodConfig` 对象，它基于 `AxiosRequestConfig`，并额外支持 `refAxios` 与 `plugins`

### 方法装饰器总览

```ts
class UserApi {
  @Get('/users')
  listUsers() {
    return undefined as never;
  }

  @Post('/users')
  createUser() {
    return undefined as never;
  }

  @Put('/users/:id')
  replaceUser() {
    return undefined as never;
  }

  @Delete('/users/:id')
  removeUser() {
    return undefined as never;
  }

  @Patch('/users/:id')
  updateUser() {
    return undefined as never;
  }

  @Options('/users')
  options() {
    return undefined as never;
  }

  @Head('/users/:id')
  headUser() {
    return undefined as never;
  }
}
```

### 字符串简写

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

### 完整配置对象

```ts
@Get({
  url: '/search',
  timeout: 1500,
  headers: {
    'X-Trace': 'search',
  },
  params: {
    source: 'dashboard',
  },
})
searchUsers(@QueryParam('q') q: string): ApiCall<User[]> {
  return undefined as never;
}
```

### 常用 `HttpMethodConfig` 字段

`HttpMethodConfig` 包含你在 `AxiosRequestConfig` 中常用的大部分字段，并额外提供两个 Decoraxios 自有字段：

- `refAxios`：为单个方法绑定专用 axios 实例
- `plugins`：为单个方法追加运行时插件

常见字段：

- `url`
- `timeout`
- `headers`
- `params`
- `data`
- `responseType`
- `transformRequest`
- `transformResponse`
- `refAxios`
- `plugins`

## 配置合并规则

类级和方法级配置会按如下规则合并：

- `timeout`、`responseType`、`baseURL` 这类标量字段由方法级覆盖类级
- `headers` 做浅合并
- `params` 做浅合并，并且 `@QueryParam` 最后覆盖
- `transformRequest` / `transformResponse` 采用追加方式
- `plugins` 采用追加方式
- 只要 `@BodyParam` 解析出了请求体，就会覆盖静态 `data`

如果最终 `baseURL` 为空，并且最终 `url` 也不是绝对地址，运行时会报错，因为 Decoraxios 无法解析出有效请求目标。

## `@PathParam`

`@PathParam(name)` 用于替换 URL 中的 `:name` 占位符：

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

当参数值为 `undefined` 或 `null` 时，占位符会保持原样。实际替换前会做 URL 编码。

## `@QueryParam`

`@QueryParam(name)` 会把参数值写入查询字符串：

```ts
@Get('/search')
search(
  @QueryParam('q') keyword: string,
  @QueryParam('page') page: number,
): ApiCall<User[]> {
  return undefined as never;
}
```

如果同一个查询名被绑定多次，Decoraxios 会把它收集成数组：

```ts
@Get('/search')
search(
  @QueryParam('tag') first: string,
  @QueryParam('tag') second: string,
): ApiCall<User[]> {
  return undefined as never;
}
```

## `@BodyParam`

`@BodyParam()` 用于绑定请求体数据。它支持无名和具名两种形式。

### 无名请求体

当整个参数都应该作为请求体时，使用无名形式：

```ts
@Post('/')
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
  return undefined as never;
}
```

### 具名请求体字段

当你想把多个参数合成为一个对象时，使用具名形式：

```ts
@Post('/')
createUser(
  @BodyParam('name') name: string,
  @BodyParam('email') email: string,
): ApiCall<User> {
  return undefined as never;
}
```

### 请求体合并规则

Decoraxios 对请求体参数的处理规则如下：

- 单个无名 `@BodyParam()` 会直接成为整个请求体
- 多个无名普通对象会做浅合并
- 多个无名非对象值会组成数组
- 多个具名请求体参数会合并为一个对象
- 当具名参数与无名普通对象混用时，会先合并无名对象，再由具名字段覆盖同名键

示例：

```ts
@Post('/')
createUser(
  @BodyParam() base: { role: string },
  @BodyParam('name') name: string,
  @BodyParam('email') email: string,
): ApiCall<User> {
  return undefined as never;
}
```

最终请求体：

```ts
{
  role: 'admin',
  name: 'Ada',
  email: 'ada@example.com'
}
```

## 综合示例

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  Head,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
} from 'decoraxios';

interface User {
  id: string;
  name: string;
}

@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/users',
  headers: {
    'X-App': 'console',
  },
})
class UserApi {
  @Get('/:id')
  detail(
    @PathParam('id') id: string,
    @QueryParam('include') include?: string,
  ): ApiCall<User> {
    return undefined as never;
  }

  @Head('/:id')
  exists(@PathParam('id') id: string): ApiCall<void> {
    return undefined as never;
  }

  @Post('/')
  create(
    @BodyParam('name') name: string,
    @BodyParam('email') email: string,
  ): ApiCall<User> {
    return undefined as never;
  }
}
```

## 声明式写法说明

Decoraxios 不会执行你原始的方法体来构建请求，所以方法体应该被视为类型占位：

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

这样类的 API 结构依然清晰，而真正的请求配置完全由装饰器驱动。
