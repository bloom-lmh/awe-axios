# IoC and AOP

`@decoraxios/ioc-aop` adds a lightweight container and aspect system for class-based applications.

## Install

```bash
npm install @decoraxios/ioc-aop reflect-metadata
```

Load `reflect-metadata` once before decorators run:

```ts
import 'reflect-metadata';
```

## `@Component`

`@Component` registers a class in the container.

### Default registration

Without options, Decoraxios uses the default module and derives the alias from the class name.

```ts
import { Component } from '@decoraxios/ioc-aop';

@Component()
class UserService {}
```

`UserService` becomes available under the alias `userService`.

### String option

The string form supports either:

- alias only, for example `'logger'`
- `module.alias`, for example `'admin.logger'`

```ts
@Component('admin.logger')
class LoggerService {}
```

### Object option

Use the object form for explicit module and alias naming.

```ts
@Component({
  module: 'admin',
  alias: 'logger',
})
class LoggerService {}
```

## `@Inject`

`@Inject` resolves a dependency onto a property.

### Empty form

The empty form relies on reflected property types:

```ts
import { Component, Inject } from '@decoraxios/ioc-aop';

@Component()
class LoggerService {}

@Component()
class UserService {
  @Inject()
  logger!: LoggerService;
}
```

This form requires `emitDecoratorMetadata: true`.

### Constructor form

```ts
@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

### String form

Use either the alias or `module.alias`.

```ts
class UserService {
  @Inject('admin.logger')
  logger!: LoggerService;
}
```

### Config object form

The object form supports:

- `module`
- `alias`
- `ctor`
- `scope`
- `backups`

```ts
class UserService {
  @Inject({
    module: 'admin',
    alias: 'logger',
    scope: 'SINGLETON',
    backups: { log: console.log },
  })
  logger!: LoggerService;
}
```

### Scope values

Available scopes:

- `SINGLETON`: reuse the same stored instance
- `TRANSIENT`: create a new instance on each injection, default behavior
- `PROTOTYPE`: create a new object with the stored instance as its prototype
- `SHALLOWCLONE`: shallow-copy the stored instance
- `DEEPCLONE`: deep-clone the stored instance

## `@Aspect`

`@Aspect(order)` registers an aspect class. Lower `order` values run first.

```ts
import { Aspect } from '@decoraxios/ioc-aop';

@Aspect(1)
class AuditAspect {}
```

## Pointcut syntax

Advice decorators accept a pointcut expression string.

Common patterns:

- `UserService.save`
- `UserService.*`
- `*.save`
- `*.*`

Wildcard matching is supported for both class names and method names.

## `@Before`

Runs before the target method.

```ts
import { Before } from '@decoraxios/ioc-aop';

class AuditAspect {
  @Before('UserService.save')
  beforeSave() {
    console.log('before save');
  }
}
```

## `@After`

Runs after the target method finishes, regardless of success or failure.

```ts
import { After } from '@decoraxios/ioc-aop';

class AuditAspect {
  @After('UserService.save')
  afterSave() {
    console.log('after save');
  }
}
```

## `@Around`

Wraps the target method and receives `AspectContext` plus `AdviceChain`.

```ts
import { AdviceChain, Around, AspectContext } from '@decoraxios/ioc-aop';

class AuditAspect {
  @Around('UserService.save')
  aroundSave(context: AspectContext, chain: AdviceChain) {
    console.log('before around', context.methodName);
    const result = chain.proceed(context);
    console.log('after around');
    return result;
  }
}
```

Use `@Around` when you need timing, tracing, wrapping return values, or custom error handling.

## `@AfterReturning`

Runs only when the target method succeeds. The resolved return value is passed as the second argument.

```ts
import { AfterReturning, AspectContext } from '@decoraxios/ioc-aop';

class AuditAspect {
  @AfterReturning('UserService.save')
  afterReturning(context: AspectContext, result: unknown) {
    console.log('saved result', result);
  }
}
```

## `@AfterThrowing`

Runs only when the target method throws or rejects. The thrown error is passed as the second argument.

```ts
import { AfterThrowing, AspectContext } from '@decoraxios/ioc-aop';

class AuditAspect {
  @AfterThrowing('UserService.save')
  afterThrowing(context: AspectContext, error: unknown) {
    console.error('save failed', context.methodName, error);
  }
}
```

## Combined example

```ts
import 'reflect-metadata';

import {
  AdviceChain,
  After,
  AfterReturning,
  AfterThrowing,
  Around,
  Aspect,
  AspectContext,
  Before,
  Component,
  Inject,
} from '@decoraxios/ioc-aop';

@Component()
class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

@Aspect(1)
class AuditAspect {
  @Before('UserService.save')
  beforeSave() {
    console.log('before save');
  }

  @Around('UserService.save')
  aroundSave(context: AspectContext, chain: AdviceChain) {
    console.log('around before', context.methodName);
    const result = chain.proceed(context);
    console.log('around after');
    return result;
  }

  @AfterReturning('UserService.save')
  afterReturning(_context: AspectContext, result: unknown) {
    console.log('result', result);
  }

  @AfterThrowing('UserService.save')
  afterThrowing(_context: AspectContext, error: unknown) {
    console.error(error);
  }

  @After('UserService.save')
  afterSave() {
    console.log('after save');
  }
}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;

  save() {
    this.logger.log('saving user');
    return 'ok';
  }
}
```
