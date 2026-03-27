# IoC / AOP

`@decoraxios/ioc-aop` 提供的是一套轻量级依赖注入和切面能力，适合已经广泛使用装饰器的项目。

## 安装

```bash
npm install @decoraxios/ioc-aop reflect-metadata
```

并且在应用入口只引入一次：

```ts
import 'reflect-metadata';
```

## 组件注册

使用 `@Component()` 注册一个类：

```ts
import { Component } from '@decoraxios/ioc-aop';

@Component()
class LoggerService {
  info(message: string) {
    console.log(message);
  }
}
```

如果你需要更显式的标识，也可以传 alias 或 module 名。

## 属性注入

在属性上使用 `@Inject(...)`：

```ts
import { Component, Inject } from '@decoraxios/ioc-aop';

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

## 注入 scope

当前支持这些作用域：

- `TRANSIENT`
- `SINGLETON`
- `PROTOTYPE`
- `SHALLOWCLONE`
- `DEEPCLONE`

例如：

```ts
@Inject({
  ctor: LoggerService,
  scope: 'SINGLETON',
})
logger!: LoggerService;
```

## AOP 基础

用 `@Aspect(order)` 定义切面，再配 advice 装饰器：

```ts
import {
  AdviceChain,
  After,
  Around,
  Aspect,
  AspectContext,
  Before,
} from '@decoraxios/ioc-aop';

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

## 支持的 advice 类型

- `@Before`
- `@After`
- `@Around`
- `@AfterReturning`
- `@AfterThrowing`

## Pointcut 匹配规则

支持通配符匹配，例如：

- `save*`
- `UserService.*`
- `*Service.save*`

## 异步方法也能织入

如果原方法返回的是 Promise，advice 链会跟着异步生命周期继续执行，不需要你再手动包装一层。

## 如何和 HTTP API 类一起用

如果你希望一个 API 类既有 HTTP 装饰器能力，又能参与切面织入，常见写法是：

```ts
@Component()
@HttpApi('https://api.example.com/users')
class UserApi {}
```

这样这个类同时处在 HTTP 装饰器系统和 IoC / AOP 系统里。

## 什么时候适合引入它

这个包比较适合这些场景：

- 你想要装饰器风格的 DI，但不想上更重的框架
- 你有日志、审计、缓存这类横切逻辑要统一织入
- 你希望 IoC / AOP 始终保持可选，而不是和 HTTP 包强耦合
