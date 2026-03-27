# Recipes

This page collects a few patterns that come up quickly in real projects.

## Bind one axios instance to a whole API class

```ts
import axios from 'axios';
import { type ApiCall, Get, HttpApi, RefAxios } from 'decoraxios';

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

## Override the axios instance on one method

```ts
import axios from 'axios';
import { AxiosRef, Get, HttpApi, RefAxios } from 'decoraxios';

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

## Create a reusable decorator

```ts
import { Post, type HttpMethodDecoratorConfig } from '@decoraxios/core';

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

## Use the full bundle explicitly

```ts
import 'reflect-metadata';
import { Component, Get, HttpApi, HttpResponse, Mock } from '@decoraxios/all';

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

## Build a demo with a custom adapter

For frontend demos or storybook-style examples, you can avoid a real backend by pairing `decoraxios` with a custom axios adapter:

```ts
import axios from 'axios';
import { Get, HttpApi, RefAxios } from 'decoraxios';

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

## Combine runtime plugins manually

If you want a custom execution rule, attach plugins directly:

```ts
import { withHttpMethodPlugins, createRetryPlugin } from '@decoraxios/core';

function RetryTwice() {
  return withHttpMethodPlugins(createRetryPlugin({ count: 2, delay: 200 }));
}
```

This is useful when you want a project-level decorator vocabulary without modifying the library itself.
