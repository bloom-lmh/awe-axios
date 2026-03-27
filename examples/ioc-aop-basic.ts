import 'reflect-metadata';

import {
  AdviceChain,
  After,
  Around,
  Aspect,
  AspectContext,
  Before,
  Component,
  Inject,
} from '@decoraxios/ioc-aop';

@Component()
class LoggerService {
  info(message: string) {
    console.log(message);
  }
}

@Aspect(1)
class AuditAspect {
  @Before('UserService.save')
  before() {
    console.log('before');
  }

  @Around('UserService.save')
  around(context: AspectContext, chain: AdviceChain) {
    console.log('around before');
    const result = chain.proceed(context);
    console.log('around after');
    return result;
  }

  @After('UserService.save')
  after() {
    console.log('after');
  }
}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;

  save() {
    this.logger.info('saved');
    return 'ok';
  }
}
