# HTTP 装饰器

这一页覆盖 Decoraxios 的核心声明装饰器：

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

`@HttpApi` 是类装饰器，用于定义共享请求配置。它支持四种传入方式：

- 绝对 URL 字符串
- 相对 URL 字符串
- `AxiosInstance`
- `HttpApiConfig` 对象

### 绝对 URL 字符串

传入绝对 URL 时，Decoraxios 会把它视为 `baseURL`。

```ts
@HttpApi('https://api.example.com')
class UserApi {}
```

### 相对 URL 字符串

传入相对字符串时，它会作为类级路径前缀。

```ts
@HttpApi('/users')
class UserApi {}
```

这种写法适合你的 axios 实例已经提供了绝对 `baseURL` 的情况。

### Axios 实例

传入 axios 实例等价于设置类级 `refAxios`。

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

当你需要类级 headers、params、transform、plugins 或路径前缀时，使用对象形式最直观。

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

## HTTP 方法装饰器

Decoraxios 为每个 HTTP 动词都提供了装饰器：

- `@Get`
- `@Post`
- `@Put`
- `@Delete`
- `@Patch`
- `@Options`
- `@Head`

每个装饰器都支持两种写法：

- 字符串简写，表示 `url`
- 完整 `HttpMethodConfig` 对象，底层兼容 `AxiosRequestConfig`，并额外支持 `refAxios`、`plugins` 等 Decoraxios 扩展字段

### 方法装饰器一览

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

### 配置合并规则

类级和方法级配置会按以下规则合并：

- `timeout`、`responseType`、`baseURL` 等标量字段由方法级覆盖类级
- `headers` 做浅合并
- `params` 做浅合并，最后再叠加 `@QueryParam`
- `transformRequest` 和 `transformResponse` 会拼接
- `plugins` 会拼接

如果最终既没有可用的 `baseURL`，`url` 本身又不是绝对地址，运行时会直接抛错。

## `@PathParam`

`@PathParam(name)` 用于替换 URL 中的 `:name` 占位符。

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

如果值是 `undefined` 或 `null`，占位符会被原样保留；替换时会自动做 URL 编码。

## `@QueryParam`

`@QueryParam(name)` 把参数绑定到请求 query。

```ts
@Get('/search')
search(
  @QueryParam('q') keyword: string,
  @QueryParam('page') page: number,
): ApiCall<User[]> {
  return undefined as never;
}
```

同一个 query 名如果绑定多次，会被收集成数组。

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

`@BodyParam()` 用于绑定请求体，可以匿名，也可以命名。

### 匿名 body

匿名形式表示整个参数就是请求体。

```ts
@Post('/')
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
  return undefined as never;
}
```

### 命名 body 字段

命名形式适合把多个参数拼成一个 body 对象。

```ts
@Post('/')
createUser(
  @BodyParam('name') name: string,
  @BodyParam('email') email: string,
): ApiCall<User> {
  return undefined as never;
}
```

### Body 合并规则

Decoraxios 对 body 参数的处理规则如下：

- 只有一个匿名 `@BodyParam()` 时，这个值直接作为 `data`
- 多个匿名 plain object 会浅合并
- 多个匿名非对象值会组成数组
- 使用命名 body 参数时，会组合成一个对象
- 如果命名参数和匿名 plain object 混用，会先合并匿名对象，再用命名字段覆盖同名 key

例如：

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

最终 body 会是：

```ts
{
  role: 'admin',
  name: 'Ada',
  email: 'ada@example.com'
}
```

## 声明式写法说明

Decoraxios 不会执行你原来的方法体来生成请求。最推荐的写法就是把方法体当成类型占位：

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

这样接口定义清晰，真正的请求配置也能完全由装饰器驱动。
