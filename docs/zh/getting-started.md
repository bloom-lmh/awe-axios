# 快速开始

## 安装 core 包

```bash
npm install awe-axios axios
```

如果你想显式地按功能拆包安装：

```bash
npm install @awe-axios/core @awe-axios/mock axios msw
```

如果你希望一次安装全部能力，可以使用 full bundle：

```bash
npm install @awe-axios/all axios msw reflect-metadata
```

现在 `awe-axios` 只对应 core 能力，`@awe-axios/all` 才是明确的全家桶入口。

## 打开装饰器支持

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 定义一个 API 类

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
  getUser(@PathParam('id') id: string, @QueryParam('expand') expand?: string): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: Pick<User, 'name'>): ApiCall<User> {
    return undefined as never;
  }
}
```

## 调用方式

```ts
const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

推荐把方法返回值写成 `ApiCall<T>`。这样既能保留完整的 Axios 响应类型，也能让装饰器代码更清晰。

## 导入策略

如果你更在意按需安装，推荐直接从 scoped 子包导入：

```ts
import { Get, HttpApi } from '@awe-axios/core';
import { Mock } from '@awe-axios/mock';
import { Component } from '@awe-axios/ioc-aop';
```

如果你只想使用短包名的 core 入口：

```ts
import { Get, HttpApi } from 'awe-axios';
```

如果你想直接从一个包里取到全部能力：

```ts
import { Component, Get, HttpApi, Mock } from '@awe-axios/all';
```
