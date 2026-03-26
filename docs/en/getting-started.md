# Getting Started

## Install the core package

```bash
npm install @awe-axios/core axios
```

If you want everything in one package:

```bash
npm install awe-axios axios msw reflect-metadata
```

The scoped feature packages treat `axios`, `msw`, and `reflect-metadata` as peer dependencies so the app keeps ownership of those versions.

## Enable decorators

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Define an API class

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

## Call it

```ts
const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

`ApiCall<T>` is the recommended return type because it keeps method signatures readable while preserving full Axios response typing.

## Import strategy

For the leanest install surface, import from the scoped packages:

```ts
import { Get, HttpApi } from '@awe-axios/core';
import { Mock } from '@awe-axios/mock';
import { Component } from '@awe-axios/ioc-aop';
```

If you install the umbrella package instead, subpath imports are also available:

```ts
import { Get, HttpApi } from 'awe-axios';
import { Mock } from 'awe-axios/mock';
import { Component } from 'awe-axios/ioc-aop';
```
