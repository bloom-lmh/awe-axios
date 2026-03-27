# @decoraxios/ioc-aop

`@decoraxios/ioc-aop` provides component registration, dependency injection, and aspect decorators for class-based applications.

## Install

```bash
npm install @decoraxios/ioc-aop reflect-metadata
```

Load `reflect-metadata` once before decorators run:

```ts
import 'reflect-metadata';
```

## Includes

- `@Component`
- `@Inject`
- `@Aspect`
- `@Before`, `@After`, `@Around`
- `@AfterReturning`, `@AfterThrowing`

## Example

```ts
import 'reflect-metadata';
import { Aspect, Before, Component, Inject } from '@decoraxios/ioc-aop';

@Component()
class LoggerService {}

@Aspect(1)
class AuditAspect {
  @Before('UserService.save')
  beforeSave() {
    console.log('before save');
  }
}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

## Documentation

- English IoC/AOP guide: <https://github.com/bloom-lmh/awe-axios/blob/master/docs/en/ioc-aop.md>
- 中文 IoC/AOP 文档: <https://github.com/bloom-lmh/awe-axios/blob/master/docs/zh/ioc-aop.md>
