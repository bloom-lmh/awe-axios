# Mock 包

`@awe-axios/mock` 提供基于 MSW 的请求拦截能力，而且不会改变方法的调用签名。

## 开启 mock

```ts
import { MockAPI } from '@awe-axios/mock';

await MockAPI.on();
```

## 给方法加上 mock

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

## 指定下一次请求使用哪个处理器

```ts
MockAPI.useNextHandler('empty');
const { data } = await new UserApi().listUsers();
```

这个选择只会生效一次，之后会自动回到 `default`。

## 这次重构修掉的重点问题

旧版本在 mock 模式下可能返回“一个还需要再调用一次的函数”。新版本已经取消了这个行为，真实请求和 mock 请求统一为一种返回值。
