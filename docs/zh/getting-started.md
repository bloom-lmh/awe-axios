# 快速开始

## 安装 core 包

```bash
npm install @awe-axios/core axios
```

如果你希望直接使用完整聚合包：

```bash
npm install awe-axios axios msw reflect-metadata
```

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
