# @decoraxios/awe-axios-mock

MSW-powered mocking support for `awe-axios`.

`@decoraxios/awe-axios-mock` adds decorator-friendly mock handlers on top of `@decoraxios/awe-axios-core`, with the same runtime calling shape as real HTTP requests.

## Install

```bash
npm install @decoraxios/awe-axios-mock @decoraxios/awe-axios-core msw axios
```

## Highlights

- `@Mock(...)` decorator for method-level mock behavior
- Browser worker and Node server support through MSW
- Queue-based mock scenario switching with `MockAPI.useNextHandler`

## Quick Example

```ts
import { type ApiCall, Get, HttpApi } from '@decoraxios/awe-axios-core';
import { HttpResponse, Mock, MockAPI } from '@decoraxios/awe-axios-mock';

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

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
