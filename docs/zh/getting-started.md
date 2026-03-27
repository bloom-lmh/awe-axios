# 快速开始

这一页只讲最短路径：安装、开启装饰器、写第一个 API 类。

## 1. 先选安装方式

如果你想用短包名的 core-first 入口：

```bash
npm install awe-axios axios
```

如果你更偏好显式的 scoped 包：

```bash
npm install @decoraxios/awe-axios-core axios
```

如果你想一次安装全套能力：

```bash
npm install @decoraxios/awe-axios-all axios msw reflect-metadata
```

::: tip
大多数新项目可以直接从 `awe-axios` 开始。只有确定需要 mock 或 IoC/AOP 时，再继续加对应子包。
:::

## 2. 打开 TypeScript 装饰器支持

在 `tsconfig.json` 里开启：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

如果你不会用到 `@decoraxios/awe-axios-ioc-aop`，`emitDecoratorMetadata` 可以先不开。

## 3. 定义第一个 API 类

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
} from 'awe-axios';

interface User {
  id: string;
  name: string;
}

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/:id')
  getUser(
    @PathParam('id') id: string,
    @QueryParam('expand') expand?: 'profile' | 'teams',
  ): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: Pick<User, 'name'>): ApiCall<User> {
    return undefined as never;
  }
}
```

## 4. 像普通异步方法一样调用

```ts
const api = new UserApi();

const { data: user } = await api.getUser('42', 'profile');
const { data: created } = await api.createUser({ name: 'Ada' });
```

装饰器不会改变方法的调用方式，它只是帮你组织请求配置和执行流程。

## 5. 推荐把返回值写成 `ApiCall<T>`

这是当前最推荐的写法：

```ts
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<User> {
    return undefined as never;
  }
}
```

它本质上等价于 `Promise<AxiosResponse<T>>`，只是更适合装饰器风格的 API 类。

## 6. 需要时绑定自定义 axios 实例

如果你的项目已经有统一配置好的 axios 实例，可以直接绑定到类上：

```ts
import axios from 'axios';
import { type ApiCall, Get, HttpApi, RefAxios } from 'awe-axios';

const request = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

@RefAxios(request)
@HttpApi('/users')
class UserApi {
  @Get('/')
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}
```

## 下一步看什么

- 看 [包选择](./packages) 决定是否要上 `@decoraxios/awe-axios-all` 或 scoped 子包。
- 看 [Core HTTP](./core) 了解 transform、策略装饰器和自定义装饰器。
- 看 [Mock](./mock) 学习如何在不改变调用方式的前提下接入 MSW。
