# IoC and AOP

`@awe-axios/ioc-aop` keeps dependency injection and aspect weaving intentionally small.

## IoC

```ts
import 'reflect-metadata';
import { Component, Inject } from '@awe-axios/ioc-aop';

@Component()
class LoggerService {
  info(message: string) {
    console.log(message);
  }
}

class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

By default, injection uses `TRANSIENT` scope. You can opt into `SINGLETON`, `PROTOTYPE`, `SHALLOWCLONE`, or `DEEPCLONE`.

## AOP

```ts
import {
  AdviceChain,
  After,
  Around,
  Aspect,
  AspectContext,
  Before,
  Component,
} from '@awe-axios/ioc-aop';

@Aspect(1)
class AuditAspect {
  @Before('UserService.save')
  before() {}

  @Around('UserService.save')
  around(context: AspectContext, chain: AdviceChain) {
    return chain.proceed(context);
  }

  @After('UserService.save')
  after() {}
}

@Component()
class UserService {
  save() {
    return 'ok';
  }
}
```

Pointcuts support wildcard matching such as:

- `save*`
- `UserService.*`
- `*Service.save*`

For HTTP API classes, the recommended pattern is to combine `@Component()` with `@HttpApi(...)` when you want them to participate in aspect weaving.
