# Decoraxios

Decoraxios 现在是一套按能力拆分的装饰器式 Axios 工具集，采用 npm workspaces monorepo 组织。

- `decoraxios` 是推荐的新主包，只包含 core HTTP 能力。
- `@decoraxios/core` 是显式的核心包。
- `@decoraxios/mock` 提供基于 MSW 的 mock 能力。
- `@decoraxios/ioc-aop` 提供 IoC / AOP 能力。
- `@decoraxios/all` 是显式的 full bundle。

兼容别名仍然保留：

- `awe-axios`
- `@decoraxios/awe-axios-core`
- `@decoraxios/awe-axios-mock`
- `@decoraxios/awe-axios-ioc-aop`
- `@decoraxios/awe-axios-all`

[English README](./README.md)

## 安装

只需要核心 HTTP：

```bash
npm install decoraxios axios
```

需要 mock：

```bash
npm install @decoraxios/core @decoraxios/mock axios msw
```

需要全量能力：

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

## 使用示例

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

## 发布流程

```bash
npm install
npm run build
npm test
npm run docs:dev
```

发布前建议额外执行：

```bash
npm run changeset
npm run version-packages
npm run release:check
```

更完整的发布说明见 [RELEASING.md](./RELEASING.md)。
