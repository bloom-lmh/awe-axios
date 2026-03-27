# Mock

`@decoraxios/awe-axios-mock` 在 core 装饰器之上补了一层基于 MSW 的请求 mock。

## 安装

```bash
npm install @decoraxios/awe-axios-core @decoraxios/awe-axios-mock axios msw
```

## 最重要的不变点

mock 不会改变你的调用方式。

```ts
const { data } = await api.listUsers();
```

无论当前是走真实请求还是 mock，请求方法都保持这个形状。

## 打开 mock 运行时

```ts
import { MockAPI } from '@decoraxios/awe-axios-mock';

await MockAPI.on();
```

关闭：

```ts
await MockAPI.off();
```

## 给方法挂 handler

你既可以传单个 handler，也可以传具名 handler 集合。

### 单个 handler

```ts
@Get('/')
@Mock(() => HttpResponse.json([{ id: '1', name: 'Ada' }]))
listUsers() {
  return undefined as never;
}
```

### 具名 handler

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

## 指定下一次请求走哪个 handler

```ts
MockAPI.useNextHandler('empty');

const { data } = await api.listUsers();
```

`useNextHandler(...)` 是队列式的一次性选择。当前这次请求用完以后，后面会重新回到 `default`。

## 完整例子

```ts
import { type ApiCall, Get, HttpApi } from '@decoraxios/awe-axios-core';
import { HttpResponse, Mock, MockAPI } from '@decoraxios/awe-axios-mock';

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

## 浏览器和 Node 都能用

这个包会按运行环境自动选择 MSW runtime：

- 浏览器环境用 `msw/browser`
- Node / test 环境用 `msw/node`

所以同一套装饰器 API 可以同时服务于本地开发和自动化测试。

## 使用时要注意

- handler 注册是懒执行的，方法第一次真正调用时才会挂上
- mock 路径基于最终解析后的请求目标生成，所以相对路径依然需要 `baseURL` 或绝对 `@HttpApi(...)`
- `MockAPI.resetHandlers()` 会清掉运行时 handler 和 next-handler 队列

## 这个包最适合什么项目

在这些场景里，`@decoraxios/awe-axios-mock` 很有价值：

- 团队已经在用 MSW
- 你希望 mock 逻辑跟 API 声明贴在一起
- 你想在 demo 或测试里快速切换场景，但不想改调用层代码
