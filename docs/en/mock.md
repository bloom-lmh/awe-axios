# Mock

`@decoraxios/mock` adds decorator-friendly mocking on top of the core HTTP package. It uses MSW under the hood, but keeps the call shape consistent with real requests.

## Install

```bash
npm install decoraxios @decoraxios/mock axios msw
```

## Absolute URL requirement

Mock registration needs an absolute request target. Use one of these patterns:

- `@HttpApi('https://api.example.com/users')`
- `@HttpApi({ baseURL: 'https://api.example.com', url: '/users' })`
- `@RefAxios(axios.create({ baseURL: 'https://api.example.com' }))`

If both `baseURL` and the resolved URL are relative, mock registration throws.

## `@Mock`

`@Mock(handlers, options?)` decorates one HTTP method with mock behavior.

`handlers` accepts either:

- A single handler function
- A record of named handlers

### Simplest form

```ts
import { Get, HttpApi, type ApiCall } from 'decoraxios';
import { HttpResponse, Mock, MockAPI } from '@decoraxios/mock';

await MockAPI.on();

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock(() => HttpResponse.json([{ id: '1', name: 'Ada' }]))
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}
```

### Named handlers

Named handlers let you switch scenarios for the next request.

```ts
import { Get, HttpApi, type ApiCall } from 'decoraxios';
import { HttpResponse, Mock, MockAPI } from '@decoraxios/mock';

await MockAPI.on();

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
    empty: () => HttpResponse.json([]),
    failed: () => HttpResponse.json({ message: 'failed' }, { status: 500 }),
  })
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

MockAPI.useNextHandler('empty');
```

### Decorator options

`@Mock` supports these options:

- `on`: local enable switch, default `true`
- `condition`: predicate evaluated before each request
- `count`: maximum number of mocked calls before falling back to the real request, default `Infinity`
- `signal`: abort signal for disabling the mock once aborted

```ts
@Mock(
  {
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
  },
  {
    count: 2,
    condition: () => true,
  },
)
```

## `MockAPI`

`MockAPI` controls the global mock runtime.

### `MockAPI.on()`

Starts the MSW runtime if needed and globally enables mocking.

```ts
await MockAPI.on();
```

### `MockAPI.off(closeRuntime?)`

Turns mocking off. Pass `true` to stop and dispose the underlying worker or server.

```ts
await MockAPI.off(true);
```

### `MockAPI.setCondition(condition)`

Applies a global predicate on top of decorator-level conditions.

```ts
MockAPI.setCondition(() => process.env.NODE_ENV !== 'production');
```

### `MockAPI.useNextHandler(name)`

Queues a named handler for the next matched request.

```ts
MockAPI.useNextHandler('failed');
```

### `MockAPI.clearNextHandlers()`

Clears any queued named handlers.

```ts
MockAPI.clearNextHandlers();
```

### `MockAPI.resetHandlers()`

Clears registered runtime handlers and the queued handler list.

```ts
MockAPI.resetHandlers();
```

### `MockAPI.listHandlers()`

Returns the currently known MSW handlers, which is useful for debugging tests.

```ts
const handlers = MockAPI.listHandlers();
```

## Mocking and real requests use the same return shape

A mocked call still resolves to `Promise<AxiosResponse<T>>`.

```ts
const response = await new UserApi().listUsers();
console.log(response.data);
```

That means components and services do not need special branching just because the data is mocked.
