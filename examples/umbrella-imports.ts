import { Get, HttpApi } from 'awe-axios';
import { HttpResponse, Mock } from 'awe-axios/mock';
import { Component, Inject } from 'awe-axios/ioc-aop';

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
