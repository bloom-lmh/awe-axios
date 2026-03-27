# 快速开始

## 官方文档

- 英文文档：[打开英文站点](https://awe-axios.vercel.app/)
- 中文文档：[打开中文站点](https://decoraxios-lh0tx0sk.maozi.io/)

## 如何选择包

按项目需求选择最小安装面：

### 只用核心 HTTP 能力

```bash
npm install decoraxios axios
```

### 核心 HTTP + Mock

```bash
npm install decoraxios @decoraxios/mock axios msw
```

### 核心 HTTP + IoC / AOP

```bash
npm install decoraxios @decoraxios/ioc-aop axios reflect-metadata
```

### 一次安装全部能力

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

大多数项目直接使用 `decoraxios` 即可。它与 `@decoraxios/core` 暴露相同的核心 HTTP API，但不会默认带上 mock 和 IoC / AOP 依赖。

## TypeScript 要求

Decoraxios 使用 TypeScript 传统装饰器语法，需要在 `tsconfig.json` 中开启：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

只有在你使用 `@Inject()` 并希望根据属性类型自动推断依赖时，`emitDecoratorMetadata` 才是必须的。

## 第一个请求

被装饰的方法本质上是“声明”，真实请求由装饰器组合生成，所以方法体通常写成占位形式：

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
} from 'decoraxios';

interface User {
  id: string;
  name: string;
}

interface CreateUserInput {
  name: string;
}

@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/users',
  timeout: 5000,
})
class UserApi {
  @Get('/:id')
  getUser(
    @PathParam('id') id: string,
    @QueryParam('include') include?: 'profile' | 'teams',
  ): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
    return undefined as never;
  }
}

const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

## 返回值类型

`ApiCall<TResponse, TRequest>` 会解析成 `Promise<AxiosResponse<TResponse, TRequest>>`。

- `TResponse` 表示 `response.data` 的结构
- `TRequest` 表示请求体的数据结构

```ts
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput>
```

## 请求配置的解析顺序

Decoraxios 会按下面的顺序组装最终请求：

1. axios 实例默认配置
2. 类上的 `@HttpApi(...)` 或 `@RefAxios(...)`
3. 方法上的 HTTP 装饰器配置，例如 `@Get(...)`、`@Post(...)`
4. 参数装饰器，例如 `@PathParam`、`@QueryParam`、`@BodyParam`
5. 运行时插件，例如 `@Retry`、`@Debounce`、`@Throttle`、`@Mock`

核心规则：

- 方法级的标量字段会覆盖类级字段
- `headers` 会浅合并
- `params` 会浅合并，并且 `@QueryParam` 最后应用
- `transformRequest` / `transformResponse` 会顺序追加
- `plugins` 会顺序追加
- 只要 `@BodyParam` 生成了请求体，就会覆盖静态 `data`

## 常见组合

- `decoraxios` 或 `@decoraxios/core`：只使用核心 HTTP 装饰器
- `decoraxios` + `@decoraxios/mock`：核心 HTTP + MSW Mock
- `decoraxios` + `@decoraxios/ioc-aop`：核心 HTTP + 依赖注入与切面
- `@decoraxios/all`：一次拿到全部公开能力

## 下一步

- 阅读 [HTTP 装饰器](./core.md)，了解 `@HttpApi`、HTTP 方法装饰器和参数装饰器
- 阅读 [运行时装饰器](./extensions.md)，了解 axios 实例绑定、请求转换、重试、防抖和节流
- 阅读 [Mock](./mock.md)，了解 `@Mock` 和 `MockAPI`
- 阅读 [IoC / AOP](./ioc-aop.md)，了解 `@Component`、`@Inject` 和切面装饰器
