# IoC and AOP

`@awe-axios/ioc-aop` provides lightweight dependency injection and aspect weaving for decorator-heavy projects.

## Install

```bash
npm install @awe-axios/ioc-aop reflect-metadata
```

Load `reflect-metadata` once in the app entry:

```ts
import 'reflect-metadata';
```

## Component registration

Register a class with `@Component()`:

```ts
import { Component } from '@awe-axios/ioc-aop';

@Component()
class LoggerService {
  info(message: string) {
    console.log(message);
  }
}
```

You can also pass an alias or module name if you need more explicit registration.

## Property injection

Use `@Inject(...)` on class properties:

```ts
import { Component, Inject } from '@awe-axios/ioc-aop';

@Component()
class LoggerService {
  info(message: string) {
    console.log(message);
  }
}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

## Injection scopes

The package supports these scopes:

- `TRANSIENT`
- `SINGLETON`
- `PROTOTYPE`
- `SHALLOWCLONE`
- `DEEPCLONE`

Example:

```ts
@Inject({
  ctor: LoggerService,
  scope: 'SINGLETON',
})
logger!: LoggerService;
```

## AOP basics

Define an aspect with `@Aspect(order)` and advice decorators:

```ts
import {
  AdviceChain,
  After,
  Around,
  Aspect,
  AspectContext,
  Before,
} from '@awe-axios/ioc-aop';

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
```

## Supported advice types

- `@Before`
- `@After`
- `@Around`
- `@AfterReturning`
- `@AfterThrowing`

## Pointcut matching

Pointcuts support wildcard matching.

Examples:

- `save*`
- `UserService.*`
- `*Service.save*`

## Async behavior

Advice execution supports both sync and async methods. If the underlying method returns a promise, the advice chain follows that async lifecycle.

## Combining with HTTP API classes

If you want an API class to participate in aspect weaving, the common pattern is:

```ts
@Component()
@HttpApi('https://api.example.com/users')
class UserApi {}
```

That keeps the class available to both the HTTP decorator system and the IoC/AOP layer.

## When to use it

This package is a good fit when:

- you want decorator-based DI without adopting a larger framework
- you need lightweight cross-cutting concerns such as logging or auditing
- you want IoC/AOP to stay optional instead of being built into the HTTP package
