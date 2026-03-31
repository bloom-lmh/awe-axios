import { describe, expect, test } from 'vitest';

import {
  Aspect,
  Component,
  Get,
  HttpResponse,
  Inject,
  Mock,
  MockWebSocketAPI,
  OnConnection,
  WebSocketState,
  WebSocketMock,
  WsAck,
  WsError,
  WsGuard,
  WsJsonData,
  WsJsonMatch,
  WsJsonPath,
  WsJsonGuard,
  WsMessageType,
  WsNamespace,
  WsPatchState,
  WsPathParam,
  WsSend,
  WsSendJson,
  WsState,
  ws,
} from '@decoraxios/all';

describe('@decoraxios/all exports', () => {
  test('exposes the full bundle from a single package', () => {
    expect(typeof Get).toBe('function');
    expect(typeof Mock).toBe('function');
    expect(typeof HttpResponse.json).toBe('function');
    expect(typeof MockWebSocketAPI.on).toBe('function');
    expect(typeof WebSocketMock).toBe('function');
    expect(typeof WebSocketState).toBe('function');
    expect(typeof OnConnection).toBe('function');
    expect(typeof WsAck).toBe('function');
    expect(typeof WsError).toBe('function');
    expect(typeof WsGuard).toBe('function');
    expect(typeof WsJsonMatch).toBe('function');
    expect(typeof WsJsonPath).toBe('function');
    expect(typeof WsJsonGuard).toBe('function');
    expect(typeof WsMessageType).toBe('function');
    expect(typeof WsNamespace).toBe('function');
    expect(typeof WsJsonData).toBe('function');
    expect(typeof WsPatchState).toBe('function');
    expect(typeof WsPathParam).toBe('function');
    expect(typeof WsState).toBe('function');
    expect(typeof WsSend).toBe('function');
    expect(typeof WsSendJson).toBe('function');
    expect(typeof ws.link).toBe('function');
    expect(typeof Component).toBe('function');
    expect(typeof Inject).toBe('function');
    expect(typeof Aspect).toBe('function');
  });
});
