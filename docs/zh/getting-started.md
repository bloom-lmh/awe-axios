# 快速开始

## 先选择包组合

按你需要的能力安装对应包：

```bash
npm install decoraxios axios
```

```bash
npm install decoraxios @decoraxios/mock axios msw
```

```bash
npm install decoraxios @decoraxios/ioc-aop axios reflect-metadata
```

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

一般项目直接装 `decoraxios` 就够了，它和 `@decoraxios/core` 暴露的是同一套核心 HTTP API，但不会默认把 Mock 和 IoC / AOP 一起带进来。

## TypeScript 要求

Decoraxios 依赖 TypeScript 传统装饰器能力，请在 `tsconfig.json` 中开启：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

只有在你使用 `@Inject()` 并希望通过属性类型自动解析依赖时，`emitDecoratorMetadata` 才是必需的。

## 第一个请求

Decoraxios 的 HTTP 方法是“声明式签名”，真正的请求会由装饰器组合生成，所以方法体通常只是一个占位实现。

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
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
  getUser(@PathParam('id') id: string): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
    return undefined as never;
  }
}

const api = new UserApi();
const { data } = await api.getUser('42');
```

## 返回值类型

`ApiCall<TResponse, TRequest>` 最终等价于 `Promise<AxiosResponse<TResponse, TRequest>>`。

- `TResponse` 对应 `response.data`
- `TRequest` 对应请求体类型

```ts
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput>
```

## 推荐组合

- `decoraxios` 或 `@decoraxios/core`：只需要核心 HTTP 装饰器
- `decoraxios` + `@decoraxios/mock`：需要核心 HTTP + Mock
- `decoraxios` + `@decoraxios/ioc-aop`：需要核心 HTTP + 依赖注入 / AOP
- `@decoraxios/all`：希望一个包导入全部能力

## 下一步阅读

- [HTTP 装饰器](./core.md)
- [运行时装饰器](./extensions.md)
- [Mock](./mock.md)
- [IoC / AOP](./ioc-aop.md)
