# Getting Started

## Choose a package layout

Pick the smallest package surface that matches your project:

```bash
npm install decoraxios axios
```

```bash
npm install decoraxios @decoraxios/mock axios msw
```

```bash
npm install decoraxios @decoraxios/ioc-aop axios reflect-metadata
```

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

Use `decoraxios` for the common case. It re-exports the same core HTTP API as `@decoraxios/core`, but keeps mock and IoC/AOP out of the dependency graph.

## TypeScript requirements

Decoraxios relies on legacy TypeScript decorators. Enable them in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

`emitDecoratorMetadata` is only required when you use `@Inject()` and want type-based resolution.

## First request

Decorated methods are signatures. The request is built from the decorators, so the method body is usually a placeholder.

```ts
import {
  type ApiCall,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
} from 'decoraxios';

interface User {
  id: string;
  name: string;
}

interface CreateUserInput {
  name: string;
}

@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/users',
  timeout: 5000,
})
class UserApi {
  @Get('/:id')
  getUser(@PathParam('id') id: string): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
    return undefined as never;
  }
}

const api = new UserApi();
const { data } = await api.getUser('42');
```

## Return typing

`ApiCall<TResponse, TRequest>` resolves to `Promise<AxiosResponse<TResponse, TRequest>>`.

- `TResponse` describes `response.data`
- `TRequest` describes the request body type when the method sends data

```ts
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput>
```

## Package combinations

- `decoraxios` or `@decoraxios/core`: core HTTP decorators only
- `decoraxios` + `@decoraxios/mock`: core HTTP plus MSW-based mocking
- `decoraxios` + `@decoraxios/ioc-aop`: core HTTP plus dependency injection and AOP
- `@decoraxios/all`: everything from one package

## Next steps

- Read [HTTP Decorators](./core.md) for `@HttpApi`, HTTP method decorators, and parameter decorators
- Read [Runtime Decorators](./extensions.md) for axios instance binding, transforms, retry, debounce, throttle, and custom plugin decorators
- Read [Mock](./mock.md) for `@Mock` and `MockAPI`
- Read [IoC and AOP](./ioc-aop.md) for `@Component`, `@Inject`, and aspect decorators
