# IoC / AOP 包

`@awe-axios/ioc-aop` 的目标是保持轻量，只提供最常用的依赖注入和切面能力。

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

默认作用域是 `TRANSIENT`。如果你需要，也可以切换到 `SINGLETON`、`PROTOTYPE`、`SHALLOWCLONE` 或 `DEEPCLONE`。

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

切点表达式支持通配符，例如：

- `save*`
- `UserService.*`
- `*Service.save*`

如果你希望 HTTP API 类也参与切面织入，推荐在 `@HttpApi(...)` 之外再额外加一个 `@Component()`。
