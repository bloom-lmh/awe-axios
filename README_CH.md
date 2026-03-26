# Awe Axios

Awe Axios 现在已经重构成一个 workspace monorepo。核心目标是把“HTTP 装饰器体验”保留下来，同时把 `mock`、`ioc`、`aop` 这些能力拆成按需安装的包，避免原来那种所有功能耦合在一起、类型和运行时行为都不稳定的情况。

[English README](./README.md)

## 包划分

| 包名 | 作用 |
| --- | --- |
| `awe-axios` | 聚合包，一次性导出全部能力 |
| `@awe-axios/core` | HTTP 装饰器、参数装饰器、请求工具函数、核心类型 |
| `@awe-axios/mock` | 基于 MSW 的 mock 装饰器和 `MockAPI` |
| `@awe-axios/ioc-aop` | 轻量 IoC 容器、`@Inject` 和 AOP 装饰器 |

如果你很在意安装体积，优先直接安装 scoped 子包。

## 安装方式

按需安装即可：

```bash
npm install @awe-axios/core axios
```

```bash
npm install @awe-axios/core @awe-axios/mock axios msw
```

```bash
npm install awe-axios axios msw reflect-metadata
```

`axios`、`msw`、`reflect-metadata` 现在在功能包里按对等依赖处理，版本由宿主项目自己控制。

如果你要使用 `@awe-axios/ioc-aop`，请在应用入口只引入一次：

```ts
import 'reflect-metadata';
```

## TypeScript 配置

在 `tsconfig.json` 中开启装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Core 使用示例

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
} from '@awe-axios/core';

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

const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

这里最关键的变化是：你可以直接把方法返回值声明成 `ApiCall<T>`，真实请求和 mock 请求都会稳定返回 `Promise<AxiosResponse<T>>`，不会再出现原来那种有时还要再调用一次函数的情况。

## 策略装饰器示例

除了工具函数，core 现在也提供正式的请求策略装饰器：

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

## Mock 使用示例

```ts
import { Get, HttpApi, type ApiCall } from '@awe-axios/core';
import { HttpResponse, Mock, MockAPI } from '@awe-axios/mock';

await MockAPI.on();

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
    empty: () => HttpResponse.json([]),
  })
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

MockAPI.useNextHandler('empty');
const { data } = await new UserApi().listUsers();
```

## IoC / AOP 使用示例

```ts
import 'reflect-metadata';

import {
  AdviceChain,
  After,
  Around,
  Aspect,
  AspectContext,
  Before,
  Component,
  Inject,
} from '@awe-axios/ioc-aop';

@Component()
class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

@Aspect(1)
class AuditAspect {
  @Before('UserService.save')
  beforeSave() {
    console.log('before save');
  }

  @Around('UserService.save')
  aroundSave(context: AspectContext, chain: AdviceChain) {
    console.log('around before');
    const result = chain.proceed(context);
    console.log('around after');
    return result;
  }

  @After('UserService.save')
  afterSave() {
    console.log('after save');
  }
}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;

  save() {
    this.logger.log('saved');
    return 'ok';
  }
}
```

## 工作区命令

```bash
npm install
npm run build
npm test
npm run docs:dev
```

## 导入方式

如果你要最强的按需安装能力：

```ts
import { Get, HttpApi } from '@awe-axios/core';
import { Mock } from '@awe-axios/mock';
import { Component } from '@awe-axios/ioc-aop';
```

如果你已经安装了聚合包，也支持子路径导入：

```ts
import { Get, HttpApi } from 'awe-axios';
import { Mock } from 'awe-axios/mock';
import { Component } from 'awe-axios/ioc-aop';
```

## 这次重构的重点

- 改成了 npm workspaces monorepo。
- `core`、`mock`、`ioc-aop` 能力彻底拆开，可以按需安装。
- HTTP 运行时改成统一 Promise 返回，TS 提示更稳定。
- mock 逻辑从 HTTP 核心中解耦成插件式能力。
- IoC / AOP 不再依赖旧的状态管理和杂糅的工厂类。
- 测试按包拆分，构建和测试都已经打通。
