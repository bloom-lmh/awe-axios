# @decoraxios/mock

`@decoraxios/mock` adds MSW-powered mocking to Decoraxios while keeping the same async call shape as real requests.

If you need WebSocket mocking, use `@decoraxios/mock-ws`.

## Install

```bash
npm install decoraxios @decoraxios/mock axios msw
```

## Includes

- `@Mock`
- `MockAPI`
- `HttpResponse`
- `http`

## Example

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
  })
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

MockAPI.useNextHandler('empty');
```

## Documentation

- English mock guide: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/en/mock.md>
- 中文 Mock 文档: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/zh/mock.md>
