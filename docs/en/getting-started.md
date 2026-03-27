# Getting Started

## Install the core package

```bash
npm install awe-axios axios
```

If you want explicit package splits:

```bash
npm install @awe-axios/core @awe-axios/mock axios msw
```

If you want everything in one package:

```bash
npm install @awe-axios/all axios msw reflect-metadata
```

`awe-axios` now maps to the core runtime only. `@awe-axios/all` is the intentional full bundle.

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

If you want a core-first convenience import, use `awe-axios`:

```ts
import { Get, HttpApi } from 'awe-axios';
```

If you want a single package that also includes mock and IoC/AOP exports:

```ts
import { Component, Get, HttpApi, Mock } from '@awe-axios/all';
```
