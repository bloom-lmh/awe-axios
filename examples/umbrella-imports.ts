import {
  Component,
  Get,
  HttpApi,
  HttpResponse,
  Inject,
  Mock,
  MockWebSocketAPI,
  OnClientMessage,
  WebSocketMock,
  WsAck,
  WsJsonData,
  WsMessageType,
} from '@decoraxios/all';

@HttpApi('https://api.example.com/users')
class UserApi {
  @Get('/')
  @Mock({
    default: () => HttpResponse.json([{ id: '1', name: 'Ada' }]),
  })
  list() {
    return undefined as never;
  }
}

@Component()
class LoggerService {}

class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}

@WebSocketMock('ws://localhost:3300/ping')
class PingSocketMock {
  @OnClientMessage()
  @WsMessageType('ping')
  @WsAck('pong')
  reply(@WsJsonData('request.id') requestId: string) {
    return { ok: true, requestId };
  }
}

MockWebSocketAPI.register(PingSocketMock);
