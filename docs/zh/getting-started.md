# 快速开始

## 安装 core 包

```bash
npm install @awe-axios/core axios
```

如果你希望直接使用完整聚合包：

```bash
npm install awe-axios axios msw reflect-metadata
```

现在 `axios`、`msw`、`reflect-metadata` 在功能包里按对等依赖处理，所以版本控制权会留在业务项目自己手里。

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
} from '@awe-axios/core';

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

推荐把方法返回值写成 `ApiCall<T>`。这样写既不会影响运行时，又能让编辑器拿到完整的 Axios 响应类型。

## 导入策略

如果你更在意按需安装，推荐直接从 scoped 子包导入：

```ts
import { Get, HttpApi } from '@awe-axios/core';
import { Mock } from '@awe-axios/mock';
import { Component } from '@awe-axios/ioc-aop';
```

如果你已经安装了聚合包，也可以使用子路径导入：

```ts
import { Get, HttpApi } from 'awe-axios';
import { Mock } from 'awe-axios/mock';
import { Component } from 'awe-axios/ioc-aop';
```
