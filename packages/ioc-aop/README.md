# @decoraxios/ioc-aop

Lightweight IoC and AOP decorators for `decoraxios`.

`@decoraxios/ioc-aop` provides component registration, dependency injection, and aspect weaving utilities built around `reflect-metadata`.

## Install

```bash
npm install @decoraxios/ioc-aop reflect-metadata
```

## Highlights

- `@Component()` and `@Inject(...)`
- `@Aspect()`, `@Before()`, `@After()`, and `@Around()`
- Singleton, transient, prototype, shallow clone, and deep clone scopes

## Quick Example

```ts
import 'reflect-metadata';
import { Component, Inject } from '@decoraxios/ioc-aop';

@Component()
class LoggerService {}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

More documentation:

- English: <https://github.com/bloom-lmh/awe-axios#readme>
- 中文: <https://github.com/bloom-lmh/awe-axios/blob/master/README_CH.md>
