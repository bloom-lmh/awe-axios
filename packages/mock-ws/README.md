# @decoraxios/mock-ws

`@decoraxios/mock-ws` adds MSW-powered WebSocket mocking as a standalone package in the Decoraxios workspace.

It supports both a decorator-first declaration style and direct access to the native MSW `ws` API.

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

## Decorator example

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
  stats(
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

const socket = new WebSocket('ws://localhost:3300/chat/alpha');
socket.addEventListener('message', event => {
  console.log(event.data);
});
```

Parameter decorators make the handler body feel closer to the rest of Decoraxios. You can inject the current client, server, event, raw message data, parsed JSON payload, path params, connection info, and per-connection state instead of manually unpacking a context object every time.

`@WebSocketState(...)` gives every connection a fresh state object, `@WsPatchState()` lets a handler merge returned data into that state, and `@WsSend()` / `@WsSendJson()` let a handler return the outbound message declaratively.

Handlers on the same socket connection are processed sequentially, so state updates remain deterministic even when the client sends multiple messages quickly.

`@WsGuard(...)` and `@WsJsonGuard(...)` let you express routing conditions at the decorator layer, which is useful when multiple handlers share the same event or message type but should react under different state or payload conditions.

`@WsAck(...)` and `@WsError(...)` add protocol-style success and failure envelopes on top of the same handler model, so you can express `"stats-ok"` / `"stats-error"` style contracts without repeating response boilerplate in every method.

`@WsJsonMatch(...)`, `@WsJsonPath(...)`, and `@WsNamespace(...)` make payload-based protocol routing read like a DSL instead of a chain of `if` statements.

## Raw MSW example

```ts
import { MockWebSocketAPI, ws } from '@decoraxios/mock-ws';

MockWebSocketAPI.registerHandlers(
  ws.link('ws://localhost:3300/chat').addEventListener('connection', ({ client }) => {
    client.send(JSON.stringify({ type: 'welcome' }));
  }),
);
```

## Node environments

MSW WebSocket mocking expects a WHATWG-compatible global `WebSocket`.

If your Node runtime does not expose `globalThis.WebSocket`, install or provide a WebSocket polyfill before calling `MockWebSocketAPI.on()`.

## Workspace example

- Protocol-style example: [../../examples/mock-ws-protocol.ts](../../examples/mock-ws-protocol.ts)

## Documentation

- English mock websocket guide: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/en/mock-ws.md>
- 中文 WebSocket Mock 指南: <https://github.com/bloom-lmh/decoraxios/blob/master/docs/zh/mock-ws.md>
