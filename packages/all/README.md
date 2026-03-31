# @decoraxios/all

`@decoraxios/all` is the full bundle package for Decoraxios. It re-exports the core HTTP decorators, the HTTP mock package, the WebSocket mock package, and the IoC/AOP package from one import surface.

## Install

```bash
npm install @decoraxios/all axios msw reflect-metadata
```

## Example

```ts
import 'reflect-metadata';
import {
  Component,
  Get,
  HttpApi,
  HttpResponse,
  Inject,
  Mock,
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
  WsMessageType,
  WsNamespace,
  WsPatchState,
  WsPathParam,
  WsSendJson,
  WsState,
  type ApiCall,
} from '@decoraxios/all';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock(() => HttpResponse.json([]))
  listUsers(): ApiCall<Array<{ id: string; name: string }>> {
    return undefined as never;
  }
}

@Component()
class LoggerService {}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}

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
  trackPing(@WsState('counters.messages') count: number) {
    return { counters: { messages: count + 1 } };
  }

  @OnClientMessage()
  @WsMessageType('stats')
  @WsAck('stats-ok')
  pong(
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
  secureStats() {
    return { type: 'secure-stats' };
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
```

## Workspace examples

- Full umbrella import reference: [../../examples/umbrella-imports.ts](../../examples/umbrella-imports.ts)
- Protocol-style WebSocket mock: [../../examples/mock-ws-protocol.ts](../../examples/mock-ws-protocol.ts)

## Documentation

- English overview: <https://github.com/bloom-lmh/decoraxios/blob/master/README.md>
- 中文说明: <https://github.com/bloom-lmh/decoraxios/blob/master/README_CH.md>
