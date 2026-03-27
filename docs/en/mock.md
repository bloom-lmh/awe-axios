# Mock

`@awe-axios/mock` adds MSW-backed request mocking on top of the core decorators.

## Install

```bash
npm install @awe-axios/core @awe-axios/mock axios msw
```

## What stays the same

The most important design rule is that mocked requests do not change how you call the method.

```ts
const { data } = await api.listUsers();
```

That is true whether the request is real or mocked.

## Turn the mock runtime on

```ts
import { MockAPI } from '@awe-axios/mock';

await MockAPI.on();
```

Turn it off again if needed:

```ts
await MockAPI.off();
```

## Add handlers to a method

You can pass either a single handler or a named handler map.

### Single handler

```ts
@Get('/')
@Mock(() => HttpResponse.json([{ id: '1', name: 'Ada' }]))
listUsers() {
  return undefined as never;
}
```

### Named handlers

```ts
@Get('/')
@Mock({
  default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
  empty: () => HttpResponse.json([]),
  error: () => HttpResponse.json({ message: 'failed' }, { status: 500 }),
})
listUsers() {
  return undefined as never;
}
```

## Pick the next handler once

```ts
MockAPI.useNextHandler('empty');

const { data } = await api.listUsers();
```

`useNextHandler(...)` is queue-based and one-shot. After that request, the method falls back to `default` again.

## Full example

```ts
import { type ApiCall, Get, HttpApi } from '@awe-axios/core';
import { HttpResponse, Mock, MockAPI } from '@awe-axios/mock';

await MockAPI.on();

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
    empty: () => HttpResponse.json([]),
  })
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

const api = new UserApi();
const first = await api.listUsers();

MockAPI.useNextHandler('empty');
const second = await api.listUsers();
```

## Browser and Node support

The package selects the MSW runtime dynamically:

- browser projects use `msw/browser`
- Node and test environments use `msw/node`

That makes the same decorator API usable in both local development and automated tests.

## Operational notes

- Mock registration happens lazily the first time the decorated method is executed.
- Mock paths are derived from the resolved request target, so relative request URLs still need a `baseURL` or absolute `@HttpApi(...)` target.
- `MockAPI.resetHandlers()` clears runtime handlers and the queued next-handler state.

## Good fits for this package

Use `@awe-axios/mock` when:

- your team already uses MSW
- you want request mocks to live next to the API declaration
- you want scenario switching in demos or tests without changing call sites
