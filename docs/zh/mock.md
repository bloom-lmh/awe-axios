# Mock

`@decoraxios/mock` 在核心 HTTP 包之上增加了装饰器风格的 Mock 能力，底层由 MSW 驱动，但调用返回值和真实请求保持一致。

## 安装

```bash
npm install decoraxios @decoraxios/mock axios msw
```

## 必须有绝对请求地址

Mock 注册阶段需要拿到绝对请求目标，因此你必须满足下面任意一种写法：

- `@HttpApi('https://api.example.com/users')`
- `@HttpApi({ baseURL: 'https://api.example.com', url: '/users' })`
- `@RefAxios(axios.create({ baseURL: 'https://api.example.com' }))`

如果最终 `baseURL` 和解析后的 `url` 都是相对地址，Mock 注册时会直接抛错。

## `@Mock`

`@Mock(handlers, options?)` 用于给某个 HTTP 方法挂上 Mock 行为。

`handlers` 支持两种形式：

- 单个 handler 函数
- 带名字的 handler 对象

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

### 命名 handler

命名 handler 适合做场景切换。

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

### 装饰器配置项

`@Mock` 支持这些配置：

- `on`：当前装饰器是否开启，默认 `true`
- `condition`：每次请求前执行的判断函数
- `count`：最多 Mock 多少次，默认 `Infinity`
- `signal`：中断后关闭当前 Mock 的 `AbortSignal`

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

`MockAPI` 用于控制全局 Mock 运行时。

### `MockAPI.on()`

启动 MSW worker 或 server，并全局开启 Mock。

```ts
await MockAPI.on();
```

### `MockAPI.off(closeRuntime?)`

全局关闭 Mock。传入 `true` 时，会额外停止底层 worker 或 server。

```ts
await MockAPI.off(true);
```

### `MockAPI.setCondition(condition)`

设置全局条件判断，会和装饰器自己的 `condition` 一起生效。

```ts
MockAPI.setCondition(() => process.env.NODE_ENV !== 'production');
```

### `MockAPI.useNextHandler(name)`

给下一次命中的请求指定命名 handler。

```ts
MockAPI.useNextHandler('failed');
```

### `MockAPI.clearNextHandlers()`

清空当前排队的命名 handler。

```ts
MockAPI.clearNextHandlers();
```

### `MockAPI.resetHandlers()`

清空已注册的运行时 handlers 和命名 handler 队列。

```ts
MockAPI.resetHandlers();
```

### `MockAPI.listHandlers()`

返回当前已知的 MSW handlers，适合调试测试环境。

```ts
const handlers = MockAPI.listHandlers();
```

## Mock 与真实请求返回值一致

Mock 请求仍然返回 `Promise<AxiosResponse<T>>`。

```ts
const response = await new UserApi().listUsers();
console.log(response.data);
```

这意味着你的组件和服务层不需要为了 Mock 再额外分支处理调用结果。
