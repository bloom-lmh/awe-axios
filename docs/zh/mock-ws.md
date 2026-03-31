# Mock WebSocket

`@decoraxios/mock-ws` 是基于 MSW 2.x 的独立 WebSocket Mock 包。

现在它已经补成了更接近 Decoraxios 其它包的装饰器模型：

- 类装饰器负责声明 WebSocket 地址
- 方法装饰器负责声明事件绑定
- 参数装饰器负责注入连接、消息和路径参数

如果你需要更底层的控制，仍然可以直接使用 MSW 原生 `ws` API。

## 安装

```bash
npm install @decoraxios/mock-ws msw
```

## 包含内容

- `MockWebSocketAPI`
- `@WebSocketMock`
- `@WebSocketState`
- `withWebSocketState`
- `withWebSocketMethodConfig`
- `withWebSocketMethodGuards`
- `@OnConnection`
- `@OnClientMessage`
- `@OnClientClose`
- `@OnServerOpen`
- `@OnServerMessage`
- `@OnServerError`
- `@OnServerClose`
- `@WsAck`
- `@WsError`
- `@WsMessageType`
- `@WsGuard`
- `@WsJsonGuard`
- `@WsJsonMatch`
- `@WsJsonPath`
- `@WsNamespace`
- `@WsContext`
- `@WsClient`
- `@WsServer`
- `@WsEvent`
- `@WsData`
- `@WsJsonData`
- `@WsParams`
- `@WsPathParam`
- `@WsInfo`
- `@WsProtocols`
- `@WsState`
- `@WsSend`
- `@WsSendJson`
- `@WsPatchState`
- `ws`

## 装饰器模式

如果你希望 WebSocket Mock 的使用体验和 Decoraxios 其它包保持一致，推荐优先使用装饰器模式。

### 参数注入示例

```ts
import {
  MockWebSocketAPI,
  OnClientMessage,
  OnConnection,
  WebSocketState,
  WebSocketMock,
  WsAck,
  WsError,
  WsGuard,
  WsJsonData,
  WsJsonGuard,
  WsJsonMatch,
  WsNamespace,
  WsMessageType,
  WsPatchState,
  WsPathParam,
  WsSendJson,
  WsState,
} from '@decoraxios/mock-ws';

@WebSocketMock('ws://localhost:3300/chat/:roomId')
@WebSocketState(() => ({ counters: { messages: 0 } }))
class ChatSocketMock {
  @OnConnection()
  @WsSendJson()
  welcome(@WsPathParam('roomId') roomId: string, @WsState() state: Record<string, unknown>) {
    state.roomId = roomId;
    return { roomId, type: 'welcome' };
  }

  @OnClientMessage()
  @WsMessageType('ping')
  @WsPatchState()
  recordPing(@WsState('counters.messages') count: number) {
    return { counters: { messages: count + 1 } };
  }

  @OnClientMessage()
  @WsMessageType('stats')
  @WsAck('stats-ok')
  reply(
    @WsJsonData('payload.request.id') requestId: string,
    @WsState('counters.messages') count: number,
    @WsState('roomId') roomId: string,
  ) {
    return { count, requestId, roomId, type: 'stats' };
  }

  @OnClientMessage()
  @WsMessageType('secure-stats')
  @WsGuard(context => Boolean((context.state.session as { authorized?: boolean } | undefined)?.authorized))
  @WsSendJson()
  secureStats(@WsState('counters.messages') count: number) {
    return { count, type: 'secure-stats' };
  }

  @OnClientMessage()
  @WsMessageType('auth')
  @WsJsonGuard(payload => typeof payload === 'object' && payload !== null && payload.token === 'letmein')
  @WsPatchState()
  authorize() {
    return { session: { authorized: true } };
  }

  @OnClientMessage()
  @WsNamespace('catalog')
  @WsJsonMatch({ meta: { phase: 'public' } })
  @WsMessageType('lookup')
  @WsAck('lookup-ok', { correlationPath: 'request.id', correlationKey: 'requestId', payloadKey: 'result' })
  lookup(@WsJsonData('payload.slug') slug: string) {
    return { slug, visibility: 'public' };
  }

  @OnClientMessage()
  @WsMessageType('explode')
  @WsError('stats-error')
  explode() {
    throw new Error('boom');
  }
}

MockWebSocketAPI.register(ChatSocketMock);

await MockWebSocketAPI.on();
```

### 事件装饰器

- `@OnConnection()`
- `@OnClientMessage()`
- `@OnClientClose()`
- `@OnServerOpen()`
- `@OnServerMessage()`
- `@OnServerError()`
- `@OnServerClose()`

### 参数装饰器

- `@WsContext()`：注入完整运行时上下文
- `@WsClient()`：注入客户端连接
- `@WsServer()`：注入 mock 服务端连接
- `@WsEvent()`：注入当前事件对象
- `@WsData()`：从消息事件里注入原始消息数据
- `@WsJsonData(name?)`：解析 JSON 消息，并可按字段提取
- `@WsParams(name?)`：注入全部路径参数，或按名称提取单个参数
- `@WsPathParam(name)`：注入单个路径参数，语义上更接近 `@PathParam(...)`
- `@WsInfo()`：注入连接信息对象
- `@WsProtocols()`：注入协商/请求的协议列表
- `@WsState(name?)`：注入当前连接独立的状态对象，或按名称提取单个状态字段

如果一个方法没有使用参数装饰器，它仍然会像旧版本那样收到单个 `context` 对象，所以旧写法依然兼容。

`@WsState()` 很适合保存计数器、房间信息或握手结果。因为装饰器类实例本身可能会被多个连接复用，而 `state` 是按连接隔离的。

`@WsJsonData(name?)` 和 `@WsState(name?)` 也支持点路径写法，比如 `payload.request.id` 或 `session.user.id`。

### 消息类型筛选

当一个处理器只想响应某一种 JSON 消息时，可以加上 `@WsMessageType(...)`。

```ts
class ChatSocketMock {
  @OnClientMessage()
  @WsMessageType('join')
  join(@WsJsonData('userId') userId: string) {
    console.log(userId);
  }
}
```

这个筛选器遇到非 JSON 消息时会直接跳过，不会抛错。

### 声明式守卫

当路由条件依赖连接状态或通用上下文时，可以使用 `@WsGuard(...)`；当路由条件依赖 JSON 消息内容时，可以使用 `@WsJsonGuard(...)`。

```ts
class ChatSocketMock {
  @OnClientMessage()
  @WsMessageType('secure-stats')
  @WsGuard(context => Boolean((context.state.session as { authorized?: boolean } | undefined)?.authorized))
  @WsSendJson()
  secureStats() {
    return { type: 'secure-stats' };
  }
}
```

守卫会在 `@WsMessageType(...)` 筛选之后、真正执行处理方法之前运行。

### 结构化 payload 路由

当路由依赖 JSON 某些字段，但你又不想回退到手写整段 guard 时，可以用 `@WsJsonMatch(...)`、`@WsJsonPath(...)` 和 `@WsNamespace(...)`。

```ts
class CatalogSocketMock {
  @OnClientMessage()
  @WsNamespace('catalog')
  @WsJsonMatch({ meta: { phase: 'public' } })
  @WsMessageType('lookup')
  lookup() {}
}
```

- `@WsJsonMatch(...)`：对入站 JSON 做深层局部匹配
- `@WsJsonPath(path, value)`：比较某个 JSON 路径的值
- `@WsNamespace(namespace, path?)`：给 namespace 风格协议准备的便捷装饰器

### 声明式响应

如果你希望“方法返回什么，就发什么”，可以使用 `@WsSend()` 或 `@WsSendJson()`。

```ts
class ChatSocketMock {
  @OnClientMessage()
  @WsSendJson()
  reply(@WsJsonData() payload: unknown) {
    return { echo: payload };
  }
}
```

- `@WsSend()`：把返回值按原始 WebSocket 数据直接发送
- `@WsSendJson()`：把返回值 `JSON.stringify(...)` 后发送

如果不加这两个装饰器，仍然可以继续手动调用 `client.send(...)`。

### 协议化响应 envelope

当你希望成功和失败响应都遵循稳定的消息协议时，可以使用 `@WsAck(...)` 和 `@WsError(...)`。

```ts
class ChatSocketMock {
  @OnClientMessage()
  @WsMessageType('stats')
  @WsAck('stats-ok')
  stats() {
    return { count: 1 };
  }

  @OnClientMessage()
  @WsMessageType('explode')
  @WsError('stats-error')
  explode() {
    throw new Error('boom');
  }
}
```

- `@WsAck('stats-ok')` 会发送 `{ type: 'stats-ok', data: <返回值> }`
- `@WsError('stats-error')` 会捕获抛出的错误，并发送 `{ type: 'stats-error', message: '...' }`

这两个装饰器默认都使用 JSON envelope，很适合拿来表达带类型字段的协议消息。
它们还可以通过 `correlationPath` 和 `correlationKey` 自动把请求里的关联字段带回响应。

### 连接状态工厂与状态补丁

当每个连接都需要一个新的初始状态时，可以使用 `@WebSocketState(...)`；当某个处理方法返回的对象需要合并进当前连接状态时，可以使用 `@WsPatchState()`。

```ts
@WebSocketState(() => ({ counters: { messages: 0 } }))
class ChatSocketMock {
  @OnClientMessage()
  @WsMessageType('ping')
  @WsPatchState()
  recordPing(@WsState('counters.messages') count: number) {
    return { counters: { messages: count + 1 } };
  }
}
```

`@WsPatchState()` 当前采用浅合并。

同一个连接上的处理方法会按顺序串行执行，所以即使客户端短时间内连续发送多条消息，状态推进仍然是确定的。

### 低层方法配置

`@WsMessageType(...)` 本质上是 `withWebSocketMethodConfig(...)` 的便捷封装。

```ts
import { OnClientMessage, WebSocketMock, withWebSocketMethodConfig } from '@decoraxios/mock-ws';

@WebSocketMock('ws://localhost:3300/chat')
class ChatSocketMock {
  @OnClientMessage()
  @withWebSocketMethodConfig({ messageType: 'ping' })
  reply() {}
}
```

### `MockWebSocketAPI.register(...)`

用于注册装饰器类或实例。

```ts
MockWebSocketAPI.register(ChatSocketMock);
MockWebSocketAPI.register(new ChatSocketMock());
```

### `createWebSocketMockHandler(...)`

用于把装饰器类转换成普通的 MSW handler。

```ts
import { createWebSocketMockHandler } from '@decoraxios/mock-ws';

const handler = createWebSocketMockHandler(ChatSocketMock);
MockWebSocketAPI.registerHandlers(handler);
```

## 原生 MSW 模式

如果你需要更底层的控制，也可以直接使用 MSW 原生 `ws`。

```ts
import { MockWebSocketAPI, ws } from '@decoraxios/mock-ws';

MockWebSocketAPI.registerHandlers(
  ws.link('ws://localhost:3300/chat').addEventListener('connection', ({ client }) => {
    client.send(JSON.stringify({ type: 'welcome' }));
  }),
);
```

## 运行时控制

### `MockWebSocketAPI.on()`

按需启动 MSW 运行时，并启用已注册的 WebSocket handlers。

```ts
await MockWebSocketAPI.on();
```

### `MockWebSocketAPI.off(closeRuntime?)`

关闭 WebSocket Mock。传入 `true` 时会连底层运行时一起停止。

```ts
await MockWebSocketAPI.off(true);
```

### `MockWebSocketAPI.use(...handlers)`

直接注册 handlers。

```ts
const chat = ws.link('ws://localhost:3300/chat');

MockWebSocketAPI.use(
  chat.addEventListener('connection', ({ client }) => {
    client.send('welcome');
  }),
);
```

### `MockWebSocketAPI.registerHandlers(...handlers)`

这是 `use(...)` 的可读性别名。

```ts
MockWebSocketAPI.registerHandlers(
  ws.link('ws://localhost:3300/chat').addEventListener('connection', ({ client }) => {
    client.send('welcome');
  }),
);
```

### `MockWebSocketAPI.register(...definitions)`

通过 runtime helper 注册装饰器类或实例。

```ts
MockWebSocketAPI.register(ChatSocketMock);
```

### `MockWebSocketAPI.link(url)`

这是 `ws.link(url)` 的快捷入口。

```ts
const room = MockWebSocketAPI.link('ws://localhost:3300/rooms/:roomId');
```

### `MockWebSocketAPI.resetHandlers()`

清空 helper 和当前运行时里的已注册 handlers。

```ts
MockWebSocketAPI.resetHandlers();
```

### `MockWebSocketAPI.listHandlers()`

返回当前已知的 WebSocket handlers，通常用于测试排查。

```ts
const handlers = MockWebSocketAPI.listHandlers();
```

## Node 环境说明

MSW 的 WebSocket Mock 依赖 WHATWG 兼容的全局 `WebSocket`。

如果你的 Node 运行时没有提供 `globalThis.WebSocket`，请在启用运行时前先安装或注入一个 polyfill。
