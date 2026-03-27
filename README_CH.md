# Awe Axios

Awe Axios 现在是一个按能力拆分的 monorepo，而且入口策略已经进一步收紧：

- `awe-axios` 现在只代表轻量的 core 能力。
- `@decoraxios/awe-axios-core` 是显式的核心 HTTP 包。
- `@decoraxios/awe-axios-mock` 提供基于 MSW 的 mock 能力。
- `@decoraxios/awe-axios-ioc-aop` 提供 IoC / AOP 装饰器。
- `@decoraxios/awe-axios-all` 是需要“一次安装拿全套”时使用的 full bundle。

[English README](./README.md)

## 包划分

| 包名 | 作用 |
| --- | --- |
| `awe-axios` | 轻量 core 入口，适合只想安装一个包但又不想带上全家桶依赖的项目 |
| `@decoraxios/awe-axios-core` | HTTP 装饰器、参数装饰器、请求策略和核心类型 |
| `@decoraxios/awe-axios-mock` | 基于 MSW 的 mock 装饰器和 `MockAPI` |
| `@decoraxios/awe-axios-ioc-aop` | 轻量 IoC 容器、`@Inject` 和 AOP 装饰器 |
| `@decoraxios/awe-axios-all` | full bundle，内部依赖 `core`、`mock` 和 `ioc-aop` |

## 安装方式

按你的使用场景安装：

```bash
npm install awe-axios axios
```

```bash
npm install @decoraxios/awe-axios-core @decoraxios/awe-axios-mock axios msw
```

```bash
npm install @decoraxios/awe-axios-all axios msw reflect-metadata
```

现在 `awe-axios` 不会再偷偷把 mock / IoC / AOP 一起带进来；如果你需要完整能力，请直接安装 `@decoraxios/awe-axios-all`。

如果你要使用 `@decoraxios/awe-axios-ioc-aop` 或 `@decoraxios/awe-axios-all`，请在应用入口只引入一次：

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

## Core 示例

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

const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

推荐把方法返回值声明成 `ApiCall<T>`。这样既保留了完整的 Axios 响应类型，又让装饰器写法更清晰。

## 请求策略装饰器

core 现在内置正式的请求策略装饰器：

```ts
import { type ApiCall, Debounce, Get, HttpApi, QueryParam, Retry, Throttle } from 'awe-axios';

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

## Mock 示例

```ts
import { Get, HttpApi, type ApiCall } from 'awe-axios';
import { HttpResponse, Mock, MockAPI } from '@decoraxios/awe-axios-mock';

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

mock 请求和真实请求的调用方式保持一致，都会返回 `Promise<AxiosResponse<T>>`。

## IoC / AOP 示例

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
} from '@decoraxios/awe-axios-ioc-aop';

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

## Full Bundle 示例

```ts
import 'reflect-metadata';
import { Component, Get, HttpApi, HttpResponse, Mock } from '@decoraxios/awe-axios-all';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
  })
  listUsers() {
    return undefined as never;
  }
}

@Component()
class LoggerService {}
```

## 导入建议

如果你更在意按需安装：

```ts
import { Get, HttpApi } from 'awe-axios';
import { Mock } from '@decoraxios/awe-axios-mock';
import { Component } from '@decoraxios/awe-axios-ioc-aop';
```

如果你更在意统一入口：

```ts
import { Get, HttpApi, Mock, Component } from '@decoraxios/awe-axios-all';
```

## 工作区命令

```bash
npm install
npm run build
npm test
npm run docs:dev
```

如果你要做发版前检查：

```bash
npm run changeset
npm run version-packages
npm run release:check
```

## 这次重构之后的重点

- 项目已经切成 npm workspaces monorepo。
- `awe-axios` 现在是真正的 core-first 入口。
- full bundle 被独立成了 `@decoraxios/awe-axios-all`。
- mock 调用不再出现双重函数返回的问题。
- IoC / AOP 继续保持可选安装。

## 自动发包

仓库已经接好了两套 GitHub Actions：

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) 负责安装、构建、类型检查、测试、文档构建和 `npm pack --dry-run`
- [`.github/workflows/release.yml`](./.github/workflows/release.yml) 负责通过 Changesets 生成版本 PR，并在版本 PR 合并后发布到 npm

推荐流程：

1. 开发完成后执行 `npm run changeset`
2. 把功能分支合并到 `master`
3. 等待 Release workflow 自动生成版本 PR
4. 合并版本 PR，自动发包

启用 npm 自动发布时：

- 推荐：给每个包配置 npm Trusted Publishing，并指向 `release.yml`
- 兜底：在 GitHub 仓库里配置 `NPM_TOKEN`

`npm run version-packages` 会在版本号更新后同步刷新 `package-lock.json`，保证 release PR 一致。

更完整的发布清单和分支保护建议见 [RELEASING.md](./RELEASING.md)。
