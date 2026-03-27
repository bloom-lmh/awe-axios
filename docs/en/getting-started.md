# Getting Started

This page shows the shortest path from installation to a typed request method.

## 1. Install the package style you want

For the short core-first entry:

```bash
npm install decoraxios axios
```

For the fully scoped core package:

```bash
npm install @decoraxios/core axios
```

For the full bundle:

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

::: tip
If you are starting fresh and only need HTTP decorators, `decoraxios` is the recommended default.
:::

## 2. Enable decorators in TypeScript

Set these compiler options in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

`emitDecoratorMetadata` is only required if you also plan to use `@decoraxios/ioc-aop`.

## 3. Define your first API class

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

## 4. Call it like a normal async API

```ts
const api = new UserApi();

const { data: user } = await api.getUser('42', 'profile');
const { data: created } = await api.createUser({ name: 'Ada' });
```

The decorated method itself is still called like a normal method. The decorator layer is only shaping request metadata and execution.

## 5. Use `ApiCall<T>` as the default return type

This pattern gives the best balance between readability and editor hints:

```ts
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<User> {
    return undefined as never;
  }
}
```

It is equivalent to returning `Promise<AxiosResponse<User>>`, but is easier to scan in decorator-based classes.

## 6. Add a custom axios instance when needed

If your project already has a configured axios instance, bind it once at the class level:

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

## Next steps

- Read [Package Selection](./packages) to choose between `decoraxios`, scoped packages, and `@decoraxios/all`.
- Read [Core HTTP](./core) for request transforms, strategy decorators, and custom decorators.
- Read [Mock](./mock) if you want request-level mocking without changing call sites.
