# Mock

`@decoraxios/mock` 在核心 HTTP 包之上提供装饰器友好的 Mock 能力。它底层使用 MSW，但调用方式与真实请求保持一致。

如果你需要 WebSocket Mock，请使用 [`@decoraxios/mock-ws`](./mock-ws.md)。

## 安装

```bash
npm install decoraxios @decoraxios/mock axios msw
```

## 绝对 URL 要求

Mock 注册必须能够解析出绝对请求目标。推荐使用以下任一方式：

- `@HttpApi('https://api.example.com/users')`
- `@HttpApi({ baseURL: 'https://api.example.com', url: '/users' })`
- `@RefAxios(axios.create({ baseURL: 'https://api.example.com' }))`

如果 `baseURL` 和最终请求 URL 都是相对路径，Mock 注册会直接报错。

## `@Mock`

`@Mock(handlers, options?)` 用于给某个 HTTP 方法添加 mock 行为。

`handlers` 支持两种形式：

- 单个处理函数
- 具名处理函数对象

### 最简单的写法

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

### 具名处理函数

具名处理函数适合切换不同场景：

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

### 装饰器选项

`@Mock` 支持以下配置：

- `on`：局部开关，默认 `true`
- `condition`：每次请求前执行的条件函数
- `count`：最多 mock 多少次，默认 `Infinity`
- `signal`：当信号中止后，mock 自动失效

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

### 回退规则

Mock 装饰器和真实请求共享同一条执行链：

- 当 mock 开启且条件满足时，请求会被重定向到 MSW
- 当 mock 关闭时，请求会回退到真实 axios 请求
- 当 `count` 用尽后，请求也会回退到真实 axios 请求

因此你可以在不改调用代码的前提下，临时切换真实接口与 Mock。

## `MockAPI`

`MockAPI` 用于控制全局 mock 运行时。

### `MockAPI.on()`

启动 MSW 运行时并全局开启 mock：

```ts
await MockAPI.on();
```

### `MockAPI.off(closeRuntime?)`

关闭 mock。传入 `true` 时会同时停止底层 worker 或 server：

```ts
await MockAPI.off(true);
```

### `MockAPI.setCondition(condition)`

为所有 mock 追加一个全局条件函数：

```ts
MockAPI.setCondition(() => process.env.NODE_ENV !== 'production');
```

### `MockAPI.useNextHandler(name)`

为下一次命中的请求指定具名 handler：

```ts
MockAPI.useNextHandler('failed');
```

### `MockAPI.clearNextHandlers()`

清空已经排队的具名 handler：

```ts
MockAPI.clearNextHandlers();
```

### `MockAPI.resetHandlers()`

清空已注册的运行时 handler 和排队列表：

```ts
MockAPI.resetHandlers();
```

### `MockAPI.listHandlers()`

返回当前运行时里的 handler 列表，通常用于测试排查：

```ts
const handlers = MockAPI.listHandlers();
```

## Mock 与真实请求的返回值一致

即使使用了 mock，返回值依然是 `Promise<AxiosResponse<T>>`：

```ts
const response = await new UserApi().listUsers();
console.log(response.data);
```

组件和服务层不需要因为数据来自 Mock 就额外写一套分支。
