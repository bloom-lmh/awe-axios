# Recipes

这一页放一些项目里很快就会遇到的实用模式。

## 给整个 API 类绑定一个 axios 实例

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

## 在单个方法上覆盖 axios 实例

```ts
import axios from 'axios';
import { AxiosRef, Get, HttpApi, RefAxios } from 'awe-axios';

const primary = axios.create({ baseURL: 'https://api.example.com' });
const backup = axios.create({ baseURL: 'https://backup.example.com' });

@RefAxios(primary)
@HttpApi('/users')
class UserApi {
  @Get('/list')
  listUsers() {
    return undefined as never;
  }

  @Get('/list')
  @AxiosRef(backup)
  listUsersFromBackup() {
    return undefined as never;
  }
}
```

## 封装一个复用装饰器

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

## 显式使用 full bundle

```ts
import 'reflect-metadata';
import { Component, Get, HttpApi, HttpResponse, Mock } from '@awe-axios/all';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock(() => HttpResponse.json([{ id: '1', name: 'Ada' }]))
  listUsers() {
    return undefined as never;
  }
}

@Component()
class LoggerService {}
```

## 用自定义 adapter 做前端 demo

如果你在做前端展示页、Storybook 或原型，不一定需要真的后端接口。可以直接配一个 axios adapter：

```ts
import axios from 'axios';
import { Get, HttpApi, RefAxios } from 'awe-axios';

const request = axios.create({
  baseURL: 'https://demo.local',
  adapter: async config => {
    return {
      data: { ok: true, url: config.url },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  },
});

@RefAxios(request)
@HttpApi('/demo')
class DemoApi {
  @Get('/status')
  status() {
    return undefined as never;
  }
}
```

## 手动组合运行时插件

如果你想给团队封装一层统一执行规则，可以直接挂插件：

```ts
import { withHttpMethodPlugins, createRetryPlugin } from '@awe-axios/core';

function RetryTwice() {
  return withHttpMethodPlugins(createRetryPlugin({ count: 2, delay: 200 }));
}
```

这种方式适合做项目级装饰器语义封装，而不必改动库本身。
