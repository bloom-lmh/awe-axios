import {
  MockWebSocketAPI,
  OnClientMessage,
  OnConnection,
  WebSocketMock,
  WebSocketState,
  WsAck,
  WsError,
  WsGuard,
  WsJsonData,
  WsJsonGuard,
  WsJsonMatch,
  WsJsonPath,
  WsMessageType,
  WsNamespace,
  WsPatchState,
  WsPathParam,
  WsProtocols,
  WsSendJson,
  WsState,
} from '@decoraxios/mock-ws';

await MockWebSocketAPI.on();

@WebSocketMock('ws://localhost:3300/chat/:roomId')
@WebSocketState(() => ({
  counters: { messages: 0 },
  session: { authorized: false },
}))
class ChatSocketMock {
  @OnConnection()
  @WsSendJson()
  welcome(
    @WsPathParam('roomId') roomId: string,
    @WsProtocols() protocols: string | string[] | undefined,
    @WsState() state: Record<string, unknown>,
  ) {
    state.roomId = roomId;
    return { type: 'welcome', roomId, protocols };
  }

  @OnClientMessage()
  @WsMessageType('auth')
  @WsJsonGuard(
    payload =>
      typeof payload === 'object' &&
      payload !== null &&
      (payload as { token?: string }).token === 'letmein',
  )
  @WsPatchState()
  authorize() {
    return { session: { authorized: true } };
  }

  @OnClientMessage()
  @WsMessageType('message')
  @WsGuard(context => Boolean((context.state.session as { authorized?: boolean } | undefined)?.authorized))
  @WsPatchState()
  countMessage(@WsState('counters.messages') messages: number) {
    return { counters: { messages: messages + 1 } };
  }

  @OnClientMessage()
  @WsMessageType('stats')
  @WsAck('stats-ok', {
    correlationKey: 'requestId',
    correlationPath: 'request.id',
    payloadKey: 'stats',
  })
  stats(
    @WsJsonData('request.id') requestId: string,
    @WsState('roomId') roomId: string,
    @WsState('counters.messages') messages: number,
  ) {
    return { requestId, roomId, messages };
  }

  @OnClientMessage()
  @WsNamespace('catalog')
  @WsJsonMatch({ meta: { phase: 'public' } })
  @WsMessageType('lookup')
  @WsAck('lookup-ok', {
    correlationKey: 'requestId',
    correlationPath: 'request.id',
    payloadKey: 'result',
  })
  lookup(@WsJsonData('payload.slug') slug: string, @WsState('roomId') roomId: string) {
    return { roomId, slug, visibility: 'public' };
  }

  @OnClientMessage()
  @WsMessageType('command')
  @WsJsonPath('payload.kind', 'danger')
  @WsError('command-error', {
    correlationKey: 'requestId',
    correlationPath: 'request.id',
  })
  crash() {
    throw new Error('Unsupported command');
  }
}

MockWebSocketAPI.register(ChatSocketMock);

const socket = new WebSocket('ws://localhost:3300/chat/lobby', ['chat-protocol']);

socket.addEventListener('message', event => {
  console.log('incoming', event.data);
});

socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'auth', token: 'letmein' }));
  socket.send(JSON.stringify({ type: 'message' }));
  socket.send(JSON.stringify({ type: 'stats', request: { id: 'req-1' } }));
  socket.send(
    JSON.stringify({
      meta: { phase: 'public' },
      namespace: 'catalog',
      payload: { slug: 'decoraxios' },
      request: { id: 'req-2' },
      type: 'lookup',
    }),
  );
});
