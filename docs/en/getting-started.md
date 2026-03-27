# Getting Started

## Official docs

- English site: [https://awe-axios.vercel.app/](https://awe-axios.vercel.app/)
- Chinese site: [https://decoraxios-lh0tx0sk.maozi.io/](https://decoraxios-lh0tx0sk.maozi.io/)

## Choose the package layout

Pick the smallest package surface that matches your project:

### Core HTTP only

```bash
npm install decoraxios axios
```

### Core HTTP + mock

```bash
npm install decoraxios @decoraxios/mock axios msw
```

### Core HTTP + IoC / AOP

```bash
npm install decoraxios @decoraxios/ioc-aop axios reflect-metadata
```

### Everything from one package

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

Use `decoraxios` for the common case. It re-exports the same core HTTP API as `@decoraxios/core`, but keeps mock and IoC / AOP out of the dependency graph.

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

`emitDecoratorMetadata` is only required when you use `@Inject()` with reflected property types.

## First request

Decorated methods are declarations. The request is assembled from decorators, so the method body is usually a placeholder:

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
  getUser(
    @PathParam('id') id: string,
    @QueryParam('include') include?: 'profile' | 'teams',
  ): ApiCall<User> {
    return undefined as never;
  }

  @Post('/')
  createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
    return undefined as never;
  }
}

const api = new UserApi();
const { data } = await api.getUser('42', 'profile');
```

## Return typing

`ApiCall<TResponse, TRequest>` resolves to `Promise<AxiosResponse<TResponse, TRequest>>`.

- `TResponse` describes `response.data`
- `TRequest` describes the request body type when the method sends data

```ts
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput>
```

## How request config is resolved

Decoraxios builds the final request from these layers, in order:

1. axios instance defaults
2. class-level `@HttpApi(...)` or `@RefAxios(...)`
3. method-level HTTP decorator config such as `@Get(...)` or `@Post(...)`
4. parameter decorators such as `@PathParam`, `@QueryParam`, and `@BodyParam`
5. runtime plugins such as `@Retry`, `@Debounce`, `@Throttle`, and `@Mock`

Important behavior:

- method-level scalar fields override class-level scalar fields
- headers are shallow-merged
- params are shallow-merged, and query decorators are applied last
- transform arrays are appended
- plugins are appended
- body data from `@BodyParam` overrides static `data` values when body decorators produce a payload

## Package combinations

- `decoraxios` or `@decoraxios/core`: core HTTP decorators only
- `decoraxios` + `@decoraxios/mock`: core HTTP plus MSW-based mocking
- `decoraxios` + `@decoraxios/ioc-aop`: core HTTP plus dependency injection and AOP
- `@decoraxios/all`: everything from one package

## Next steps

- Read [HTTP Decorators](./core.md) for `@HttpApi`, HTTP method decorators, and parameter decorators
- Read [Runtime Decorators](./extensions.md) for axios instance binding, transforms, retry, debounce, and throttle
- Read [Mock](./mock.md) for `@Mock` and `MockAPI`
- Read [IoC and AOP](./ioc-aop.md) for `@Component`, `@Inject`, and aspect decorators
