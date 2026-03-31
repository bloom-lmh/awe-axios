import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  MockWebSocketAPI,
  OnClientMessage,
  OnConnection,
  WebSocketState,
  WebSocketMock,
  WsAck,
  WsClient,
  WsData,
  WsError,
  WsEvent,
  WsGuard,
  WsJsonData,
  WsJsonGuard,
  WsJsonMatch,
  WsJsonPath,
  WsMessageType,
  WsNamespace,
  WsPatchState,
  WsParams,
  WsPathParam,
  WsProtocols,
  WsSend,
  WsSendJson,
  WsState,
  ws,
} from '../index.js';

const originalWebSocketDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'WebSocket');

class TestWebSocket extends EventTarget {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  url: string;
  protocol = '';
  extensions = '';
  binaryType: BinaryType = 'blob';
  readyState = TestWebSocket.CONNECTING;
  bufferedAmount = 0;
  onopen: ((this: WebSocket, event: Event) => void) | null = null;
  onmessage: ((this: WebSocket, event: MessageEvent) => void) | null = null;
  onerror: ((this: WebSocket, event: Event) => void) | null = null;
  onclose: ((this: WebSocket, event: Event) => void) | null = null;

  constructor(url: string | URL, protocols?: string | string[]) {
    super();
    this.url = String(url);
    this.protocol = Array.isArray(protocols) ? (protocols[0] ?? '') : (protocols ?? '');
  }

  send(_data: unknown) {}

  close() {
    this.readyState = TestWebSocket.CLOSED;
  }
}

function installTestWebSocket() {
  Object.defineProperty(globalThis, 'WebSocket', {
    configurable: true,
    writable: true,
    value: TestWebSocket as unknown as typeof WebSocket,
  });
}

function restoreWebSocket() {
  if (originalWebSocketDescriptor) {
    Object.defineProperty(globalThis, 'WebSocket', originalWebSocketDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'WebSocket');
}

function nextSocketMessage(socket: WebSocket): Promise<string> {
  return new Promise(resolve => {
    socket.addEventListener(
      'message',
      event => {
        resolve(String(event.data));
      },
      { once: true },
    );
  });
}

async function nextSocketJsonMessage<T>(socket: WebSocket): Promise<T> {
  return JSON.parse(await nextSocketMessage(socket)) as T;
}

function waitForSocketOpen(socket: WebSocket): Promise<void> {
  if (socket.readyState === socket.OPEN) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    socket.addEventListener(
      'open',
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

function expectNoSocketMessage(socket: WebSocket, timeoutMs: number = 50): Promise<void> {
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      clearTimeout(timer);
      reject(new Error(`Expected no socket message, but received: ${String(event.data)}`));
    };

    const timer = setTimeout(() => {
      socket.removeEventListener('message', onMessage);
      resolve();
    }, timeoutMs);

    socket.addEventListener('message', onMessage, { once: true });
  });
}

beforeEach(() => {
  installTestWebSocket();
});

afterEach(async () => {
  MockWebSocketAPI.resetHandlers();
  await MockWebSocketAPI.off(true);
  restoreWebSocket();
});

describe('@decoraxios/mock-ws', () => {
  test('supports raw MSW ws handler registration and inspection through the runtime helper', () => {
    const room = ws.link('ws://localhost:3300/rooms/:roomId');

    MockWebSocketAPI.registerHandlers(
      room.addEventListener('connection', ({ client, params }) => {
        client.send(params.roomId);
      }),
    );

    expect(MockWebSocketAPI.listHandlers()).toHaveLength(1);
  });

  test('supports decorator-based websocket mocks with parameter decorators, message routing, and connection state', async () => {
    @WebSocketMock('ws://localhost:3300/chat/:roomId')
    class ChatSocketMock {
      @OnConnection()
      @WsSendJson()
      welcome(
        @WsPathParam('roomId') roomId: string,
        @WsProtocols() protocols: string | string[] | undefined,
        @WsState() state: Record<string, unknown>,
      ) {
        state.roomId = roomId;
        state.messageCount = 0;

        return {
          protocol: Array.isArray(protocols) ? (protocols[0] ?? '') : (protocols ?? ''),
          roomId,
          type: 'welcome',
        };
      }

      @OnClientMessage()
      @WsMessageType('ping')
      @WsSendJson()
      reply(
        @WsJsonData('message') message: string,
        @WsData() raw: unknown,
        @WsEvent() event: MessageEvent,
        @WsState() state: Record<string, unknown>,
      ) {
        state.messageCount = Number(state.messageCount ?? 0) + 1;

        return {
          count: state.messageCount,
          eventType: event.type,
          message,
          raw: String(raw),
          roomId: String(state.roomId ?? ''),
          type: 'pong',
        };
      }

      @OnClientMessage()
      @WsSend()
      echo(@WsData() data: unknown) {
        if (typeof data === 'string' && data.startsWith('plain:')) {
          return data.toUpperCase();
        }
      }
    }

    @WebSocketMock('ws://localhost:3300/state/:roomId')
    @WebSocketState(() => ({
      counters: {
        messages: 0,
      },
      room: {
        id: '',
      },
      session: {
        authorized: false,
      },
    }))
    class StatefulSocketMock {
      @OnConnection()
      @WsPatchState()
      initialize(
        @WsClient() client: { send: (data: string) => void },
        @WsPathParam('roomId') roomId: string,
      ) {
        client.send(JSON.stringify({ roomId, type: 'ready' }));
        return {
          room: {
            id: roomId,
          },
        };
      }

      @OnClientMessage()
      @WsMessageType('ping')
      @WsPatchState()
      recordPing(@WsState('counters.messages') count: number) {
        return {
          counters: {
            messages: count + 1,
          },
        };
      }

      @OnClientMessage()
      @WsMessageType('auth')
      @WsJsonGuard(payload => {
        return typeof payload === 'object' && payload !== null && payload.token === 'letmein';
      })
      @WsPatchState()
      authorize() {
        return {
          session: {
            authorized: true,
          },
        };
      }

      @OnClientMessage()
      @WsMessageType('auth')
      @WsJsonGuard(payload => {
        return typeof payload === 'object' && payload !== null && payload.token !== 'letmein';
      })
      @WsSendJson()
      authDenied() {
        return {
          type: 'auth-denied',
        };
      }

      @OnClientMessage()
      @WsMessageType('stats')
      @WsGuard(context => Boolean((context.state.session as { authorized?: boolean } | undefined)?.authorized))
      @WsAck('stats-ok')
      stats(
        @WsJsonData('payload.request.id') requestId: string,
        @WsState('room.id') roomId: string,
        @WsState('counters.messages') count: number,
      ) {
        return {
          count,
          requestId,
          roomId,
          type: 'stats',
        };
      }

      @OnClientMessage()
      @WsMessageType('explode')
      @WsError('stats-error', { detailsKey: 'details' })
      explode() {
        throw new Error('boom');
      }
    }

    @WebSocketMock('ws://localhost:3300/protocol')
    class ProtocolSocketMock {
      @OnClientMessage()
      @WsNamespace('catalog')
      @WsJsonMatch({
        meta: {
          phase: 'public',
        },
      })
      @WsMessageType('lookup')
      @WsAck('lookup-ok', {
        correlationKey: 'requestId',
        correlationPath: 'request.id',
        payloadKey: 'result',
      })
      lookupPublic(@WsJsonData('payload.slug') slug: string) {
        return {
          slug,
          visibility: 'public',
        };
      }

      @OnClientMessage()
      @WsNamespace('catalog')
      @WsJsonPath('meta.phase', 'private')
      @WsMessageType('lookup')
      @WsAck('lookup-private', {
        correlationKey: 'requestId',
        correlationPath: 'request.id',
        payloadKey: 'result',
      })
      lookupPrivate(@WsJsonData('payload.slug') slug: string) {
        return {
          slug,
          visibility: 'private',
        };
      }

      @OnClientMessage()
      @WsNamespace('catalog')
      @WsMessageType('explode')
      @WsError('lookup-error', {
        correlationKey: 'requestId',
        correlationPath: 'request.id',
        detailsKey: 'details',
      })
      explodeProtocol() {
        throw new Error('missing catalog entry');
      }
    }

    MockWebSocketAPI.register(ChatSocketMock, StatefulSocketMock, ProtocolSocketMock);

    await MockWebSocketAPI.on();

    const socket = new WebSocket('ws://localhost:3300/chat/blue', 'decoraxios');
    await expect(nextSocketJsonMessage(socket)).resolves.toEqual({
      protocol: 'decoraxios',
      roomId: 'blue',
      type: 'welcome',
    });

    const pongMessage = nextSocketJsonMessage<{
      eventType: string;
      message: string;
      raw: string;
      roomId: string;
      type: string;
    }>(socket);
    socket.send(JSON.stringify({ message: 'hello', type: 'ping' }));
    await expect(pongMessage).resolves.toEqual({
      count: 1,
      eventType: 'message',
      message: 'hello',
      raw: '{"message":"hello","type":"ping"}',
      roomId: 'blue',
      type: 'pong',
    });

    const secondPongMessage = nextSocketJsonMessage<{
      count: number;
      roomId: string;
      type: string;
    }>(socket);
    socket.send(JSON.stringify({ message: 'again', type: 'ping' }));
    await expect(secondPongMessage).resolves.toMatchObject({
      count: 2,
      roomId: 'blue',
      type: 'pong',
    });

    const echoMessage = nextSocketMessage(socket);
    socket.send('plain:hi');
    await expect(echoMessage).resolves.toBe('PLAIN:HI');
    socket.close();

    const socketA = new WebSocket('ws://localhost:3300/state/alpha');
    await expect(nextSocketJsonMessage(socketA)).resolves.toEqual({
      roomId: 'alpha',
      type: 'ready',
    });
    socketA.send(JSON.stringify({ token: 'letmein', type: 'auth' }));
    socketA.send(JSON.stringify({ type: 'ping' }));
    socketA.send(JSON.stringify({ type: 'ping' }));

    const statsA = nextSocketJsonMessage<{
      data: {
        count: number;
        requestId: string;
        roomId: string;
        type: string;
      };
      type: string;
    }>(socketA);
    socketA.send(JSON.stringify({ payload: { request: { id: 'req-a' } }, type: 'stats' }));
    await expect(statsA).resolves.toEqual({
      data: {
        count: 2,
        requestId: 'req-a',
        roomId: 'alpha',
        type: 'stats',
      },
      type: 'stats-ok',
    });

    const explodeA = nextSocketJsonMessage<{
      details: {
        name: string;
      };
      message: string;
      type: string;
    }>(socketA);
    socketA.send(JSON.stringify({ type: 'explode' }));
    await expect(explodeA).resolves.toEqual({
      details: {
        name: 'Error',
      },
      message: 'boom',
      type: 'stats-error',
    });
    socketA.close();

    const socketB = new WebSocket('ws://localhost:3300/state/beta');
    await expect(nextSocketJsonMessage(socketB)).resolves.toEqual({
      roomId: 'beta',
      type: 'ready',
    });
    const denied = nextSocketJsonMessage<{
      type: string;
    }>(socketB);
    socketB.send(JSON.stringify({ token: 'nope', type: 'auth' }));
    await expect(denied).resolves.toEqual({
      type: 'auth-denied',
    });

    socketB.send(JSON.stringify({ payload: { request: { id: 'req-b' } }, type: 'stats' }));
    await expect(expectNoSocketMessage(socketB)).resolves.toBeUndefined();

    socketB.send(JSON.stringify({ token: 'letmein', type: 'auth' }));
    const statsB = nextSocketJsonMessage<{
      data: {
        count: number;
        requestId: string;
        roomId: string;
        type: string;
      };
      type: string;
    }>(socketB);
    socketB.send(JSON.stringify({ payload: { request: { id: 'req-b' } }, type: 'stats' }));
    await expect(statsB).resolves.toEqual({
      data: {
        count: 0,
        requestId: 'req-b',
        roomId: 'beta',
        type: 'stats',
      },
      type: 'stats-ok',
    });
    socketB.close();

    const socketC = new WebSocket('ws://localhost:3300/protocol');
    await waitForSocketOpen(socketC);
    const publicLookup = nextSocketJsonMessage<{
      requestId: string;
      result: {
        slug: string;
        visibility: string;
      };
      type: string;
    }>(socketC);
    socketC.send(
      JSON.stringify({
        meta: {
          phase: 'public',
        },
        namespace: 'catalog',
        payload: {
          slug: 'chairs',
        },
        request: {
          id: 'req-lookup-1',
        },
        type: 'lookup',
      }),
    );
    await expect(publicLookup).resolves.toEqual({
      requestId: 'req-lookup-1',
      result: {
        slug: 'chairs',
        visibility: 'public',
      },
      type: 'lookup-ok',
    });

    socketC.send(
      JSON.stringify({
        meta: {
          phase: 'public',
        },
        namespace: 'inventory',
        payload: {
          slug: 'lamps',
        },
        request: {
          id: 'req-ignore',
        },
        type: 'lookup',
      }),
    );
    await expect(expectNoSocketMessage(socketC)).resolves.toBeUndefined();

    const privateLookup = nextSocketJsonMessage<{
      requestId: string;
      result: {
        slug: string;
        visibility: string;
      };
      type: string;
    }>(socketC);
    socketC.send(
      JSON.stringify({
        meta: {
          phase: 'private',
        },
        namespace: 'catalog',
        payload: {
          slug: 'desks',
        },
        request: {
          id: 'req-lookup-2',
        },
        type: 'lookup',
      }),
    );
    await expect(privateLookup).resolves.toEqual({
      requestId: 'req-lookup-2',
      result: {
        slug: 'desks',
        visibility: 'private',
      },
      type: 'lookup-private',
    });

    const protocolError = nextSocketJsonMessage<{
      details: {
        name: string;
      };
      message: string;
      requestId: string;
      type: string;
    }>(socketC);
    socketC.send(
      JSON.stringify({
        namespace: 'catalog',
        request: {
          id: 'req-lookup-3',
        },
        type: 'explode',
      }),
    );
    await expect(protocolError).resolves.toEqual({
      details: {
        name: 'Error',
      },
      message: 'missing catalog entry',
      requestId: 'req-lookup-3',
      type: 'lookup-error',
    });
    socketC.close();
  });

  test('supports decorated instance registration, explicit handler creation, inspection, and reset through the runtime helper', () => {
    @WebSocketMock('ws://localhost:3300/rooms/:roomId')
    class RoomSocketMock {
      @OnConnection()
      connect(
        @WsClient() client: { send: (data: string) => void },
        @WsParams() params: Record<string, string>,
      ) {
        client.send(params.roomId);
      }
    }

    const handler = MockWebSocketAPI.createHandler(new RoomSocketMock());
    MockWebSocketAPI.registerHandlers(handler);

    expect(MockWebSocketAPI.listHandlers()).toHaveLength(1);

    MockWebSocketAPI.resetHandlers();
    expect(MockWebSocketAPI.listHandlers()).toHaveLength(0);
  });
});
