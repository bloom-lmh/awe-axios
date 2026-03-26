# Mock

`@awe-axios/mock` adds MSW-backed interception without changing how you call request methods.

## Enable mock mode

```ts
import { MockAPI } from '@awe-axios/mock';

await MockAPI.on();
```

## Decorate a method

```ts
import { type ApiCall, Get, HttpApi } from '@awe-axios/core';
import { HttpResponse, Mock } from '@awe-axios/mock';

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
```

## Pick a handler for the next request

```ts
MockAPI.useNextHandler('empty');
const { data } = await new UserApi().listUsers();
```

This selection is one-shot. The next request after that will fall back to `default` again.

## Important behavioral change

The old implementation could return another function in mock mode. The rebuilt version no longer does that. Real and mocked requests share one return shape.
