# Core 核心包

`@awe-axios/core` 是大多数项目最应该先安装的包。

## 核心思路

- 类装饰器负责定义共享的 HTTP 默认配置
- 方法装饰器负责声明请求方法和请求级配置
- 参数装饰器负责把调用参数映射到路径、查询和请求体
- 对调用方来说，这些方法依然就是普通的异步方法

## 推荐的类型写法

```ts
import { type ApiCall, Get, HttpApi } from '@awe-axios/core';

interface Team {
  id: string;
  name: string;
}

@HttpApi('https://api.example.com/teams')
class TeamApi {
  @Get('/')
  listTeams(): ApiCall<Team[]> {
    return undefined as never;
  }
}
```

## 自定义装饰器

可以用 `withHttpMethodConfig` 构建自己的封装装饰器：

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

## 运行时工具函数

`useRetry`、`useDebounce`、`useThrottle` 是通用异步包装器，不只能用在装饰器请求上，也可以直接包你自己的异步函数。
