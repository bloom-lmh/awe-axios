import { Component, Get, HttpApi, HttpResponse, Inject, Mock } from '@awe-axios/all';

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
