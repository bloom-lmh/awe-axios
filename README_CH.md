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

如果你要准备发布或做发包前检查，也可以直接使用：

```bash
npm run changeset
npm run version-packages
npm run release:check
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

## 自动发包工作流

仓库现在已经补好了两套 GitHub Actions：

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) 负责安装依赖、构建、类型检查、测试、文档构建和 `npm pack --dry-run`。
- [`.github/workflows/release.yml`](./.github/workflows/release.yml) 负责通过 Changesets 自动创建或更新版本 PR，并在版本 PR 合并后发布到 npm。

推荐的发版流程是：

1. 开发完成后执行 `npm run changeset` 生成版本说明。
2. 把功能分支合并到 `master`。
3. Release workflow 自动创建或更新版本 PR。
4. 合并版本 PR，自动发布所有需要发布的包。

启用 npm 自动发布时，建议这样配置：

- 推荐方案：在 npm 上为每个包配置 Trusted Publishing，并把 workflow 文件名填成 `release.yml`。
- 兜底方案：在 GitHub 仓库里配置 `NPM_TOKEN` secret。

现在 `npm run version-packages` 会在执行 `changeset version` 后同步刷新 `package-lock.json`，这样版本 PR 不会遗漏锁文件更新。

如果你想看更完整的发版步骤、分支保护建议和 release PR 合并策略，可以直接看 [RELEASING.md](./RELEASING.md)。
