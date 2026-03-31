# Mock WebSocket

`@decoraxios/mock-ws` provides standalone WebSocket mocking on top of MSW 2.x.

It now supports a more Decoraxios-style decorator model:

- class decorators for the WebSocket endpoint
- method decorators for event binding
- parameter decorators for payload and connection injection

You can still drop down to the native MSW `ws` API when you need lower-level control.

## Install

```bash
npm install @decoraxios/mock-ws msw
```

## Includes

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

## Decorator mode

Decorator mode is the preferred style when you want WebSocket mocks to feel like the rest of Decoraxios.

### Parameter-driven example

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

### Event decorators

- `@OnConnection()`
- `@OnClientMessage()`
- `@OnClientClose()`
- `@OnServerOpen()`
- `@OnServerMessage()`
- `@OnServerError()`
- `@OnServerClose()`

### Parameter decorators

- `@WsContext()`: inject the full runtime context
- `@WsClient()`: inject the client-side connection
- `@WsServer()`: inject the mock server-side connection
- `@WsEvent()`: inject the current DOM event
- `@WsData()`: inject raw message data from a message event
- `@WsJsonData(name?)`: parse message JSON and optionally pick one field
- `@WsParams(name?)`: inject all route params or a single param by name
- `@WsPathParam(name)`: inject one route param, similar to `@PathParam(...)`
- `@WsInfo()`: inject the connection info object
- `@WsProtocols()`: inject the negotiated/requested protocols
- `@WsState(name?)`: inject the per-connection state bag or one state field

Methods without parameter decorators still receive the original single `context` object, so the previous API remains compatible.

`@WsState()` is especially useful because a decorated mock class instance may be reused across connections. Connection state gives you a safe per-socket place to keep counters, room metadata, or handshake results.

`@WsJsonData(name?)` and `@WsState(name?)` also support dotted paths such as `payload.request.id` or `session.user.id`.

### Message filtering

Use `@WsMessageType(...)` when a handler should only react to JSON messages with a specific `type` field.

```ts
class ChatSocketMock {
  @OnClientMessage()
  @WsMessageType('join')
  join(@WsJsonData('userId') userId: string) {
    console.log(userId);
  }
}
```

This matcher safely skips non-JSON messages instead of throwing.

### Declarative guards

Use `@WsGuard(...)` when routing depends on connection state or generic context, and `@WsJsonGuard(...)` when routing depends on parsed JSON payload content.

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

Guards run after `@WsMessageType(...)` filtering and before the decorated handler body executes.

### Structured payload routing

Use `@WsJsonMatch(...)`, `@WsJsonPath(...)`, and `@WsNamespace(...)` when routing should depend on specific JSON fields without dropping down to a full custom guard.

```ts
class CatalogSocketMock {
  @OnClientMessage()
  @WsNamespace('catalog')
  @WsJsonMatch({ meta: { phase: 'public' } })
  @WsMessageType('lookup')
  lookup() {}
}
```

- `@WsJsonMatch(...)`: deep partial match against the incoming JSON payload
- `@WsJsonPath(path, value)`: compare one JSON path to an expected value
- `@WsNamespace(namespace, path?)`: convenience wrapper for namespace-style payload routing

### Declarative responses

Use `@WsSend()` or `@WsSendJson()` when you want the method return value to become the outbound message.

```ts
class ChatSocketMock {
  @OnClientMessage()
  @WsSendJson()
  reply(@WsJsonData() payload: unknown) {
    return { echo: payload };
  }
}
```

- `@WsSend()`: sends the returned raw WebSocket data
- `@WsSendJson()`: JSON-serializes the returned value before sending

When these decorators are absent, you can still call `client.send(...)` manually.

### Protocol envelopes

Use `@WsAck(...)` and `@WsError(...)` when you want success and failure responses to follow a stable message contract.

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

- `@WsAck('stats-ok')` sends `{ type: 'stats-ok', data: <return-value> }`
- `@WsError('stats-error')` catches thrown errors and sends `{ type: 'stats-error', message: '...' }`

Both decorators use JSON envelopes, so they fit naturally with typed message protocols.
They can also copy a request/correlation field from the incoming payload via `correlationPath` and `correlationKey`.

### Connection state factories and patching

Use `@WebSocketState(...)` when every connection should start with a fresh state object, and `@WsPatchState()` when a handler should merge its returned object into that state.

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

`@WsPatchState()` performs a shallow merge into the current connection state.

Handlers on the same connection are executed sequentially, so rapid message bursts still observe a deterministic state progression.

### Low-level method config

`@WsMessageType(...)` is a convenience wrapper around `withWebSocketMethodConfig(...)`.

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

Registers decorated classes or instances.

```ts
MockWebSocketAPI.register(ChatSocketMock);
MockWebSocketAPI.register(new ChatSocketMock());
```

### `createWebSocketMockHandler(...)`

Builds a plain MSW handler from a decorated class or instance.

```ts
import { createWebSocketMockHandler } from '@decoraxios/mock-ws';

const handler = createWebSocketMockHandler(ChatSocketMock);
MockWebSocketAPI.registerHandlers(handler);
```

## Raw MSW mode

You can still work directly with MSW `ws` handlers.

```ts
import { MockWebSocketAPI, ws } from '@decoraxios/mock-ws';

MockWebSocketAPI.registerHandlers(
  ws.link('ws://localhost:3300/chat').addEventListener('connection', ({ client }) => {
    client.send(JSON.stringify({ type: 'welcome' }));
  }),
);
```

## Runtime control

### `MockWebSocketAPI.on()`

Starts the MSW runtime if needed and enables the registered WebSocket handlers.

```ts
await MockWebSocketAPI.on();
```

### `MockWebSocketAPI.off(closeRuntime?)`

Turns the WebSocket mocking layer off. Pass `true` to stop and dispose the underlying runtime.

```ts
await MockWebSocketAPI.off(true);
```

### `MockWebSocketAPI.use(...handlers)`

Registers handlers directly.

```ts
const chat = ws.link('ws://localhost:3300/chat');

MockWebSocketAPI.use(
  chat.addEventListener('connection', ({ client }) => {
    client.send('welcome');
  }),
);
```

### `MockWebSocketAPI.registerHandlers(...handlers)`

Alias of `use(...)`, provided for readability.

```ts
MockWebSocketAPI.registerHandlers(
  ws.link('ws://localhost:3300/chat').addEventListener('connection', ({ client }) => {
    client.send('welcome');
  }),
);
```

### `MockWebSocketAPI.register(...definitions)`

Registers decorated classes or instances through the runtime helper.

```ts
MockWebSocketAPI.register(ChatSocketMock);
```

### `MockWebSocketAPI.link(url)`

Shortcut for `ws.link(url)`.

```ts
const room = MockWebSocketAPI.link('ws://localhost:3300/rooms/:roomId');
```

### `MockWebSocketAPI.resetHandlers()`

Clears registered handlers from the helper and the active runtime.

```ts
MockWebSocketAPI.resetHandlers();
```

### `MockWebSocketAPI.listHandlers()`

Returns the currently known WebSocket handlers. This is mainly useful in tests.

```ts
const handlers = MockWebSocketAPI.listHandlers();
```

## Node environments

MSW WebSocket mocking expects a WHATWG-compatible global `WebSocket`.

If your Node runtime does not expose `globalThis.WebSocket`, install or provide a polyfill before enabling the runtime.
