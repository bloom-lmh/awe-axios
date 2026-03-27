# IoC / AOP

`@decoraxios/ioc-aop` 为类风格项目提供了一个轻量容器和切面系统。

## 安装

```bash
npm install @decoraxios/ioc-aop reflect-metadata
```

在装饰器执行前，只加载一次 `reflect-metadata`：

```ts
import 'reflect-metadata';
```

## `@Component`

`@Component` 用于把类注册进容器。

### 默认注册

不传参数时，会使用默认模块，并根据类名推导 alias。

```ts
import { Component } from '@decoraxios/ioc-aop';

@Component()
class UserService {}
```

例如 `UserService` 默认会以 `userService` 这个 alias 注册。

### 字符串参数

字符串参数支持两种形式：

- 只写 alias，比如 `'logger'`
- 写成 `module.alias`，比如 `'admin.logger'`

```ts
@Component('admin.logger')
class LoggerService {}
```

### 对象参数

对象形式适合显式指定模块和别名。

```ts
@Component({
  module: 'admin',
  alias: 'logger',
})
class LoggerService {}
```

## `@Inject`

`@Inject` 用于把依赖注入到属性上，一共支持三种形式。

### 构造函数形式

```ts
import { Component, Inject } from '@decoraxios/ioc-aop';

@Component()
class LoggerService {}

@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

### 字符串形式

可以直接按 alias 或 `module.alias` 注入。

```ts
class UserService {
  @Inject('admin.logger')
  logger!: LoggerService;
}
```

### 配置对象形式

完整配置支持：

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

### 可用 scope

- `SINGLETON`：始终返回同一个实例
- `TRANSIENT`：每次注入都新建实例，默认值
- `PROTOTYPE`：以已存实例为原型创建新对象
- `SHALLOWCLONE`：对已存实例做浅拷贝
- `DEEPCLONE`：对已存实例做深拷贝

## `@Aspect`

`@Aspect(order)` 用于注册切面类。`order` 越小，执行顺序越靠前。

```ts
import { Aspect } from '@decoraxios/ioc-aop';

@Aspect(1)
class AuditAspect {}
```

## 切点表达式

通知装饰器接收字符串形式的切点表达式。

常见写法：

- `UserService.save`
- `UserService.*`
- `*.save`
- `*.*`

类名和方法名都支持通配符。

## `@Before`

在目标方法执行前触发。

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

在目标方法结束后触发，不区分成功还是失败。

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

环绕通知会拿到 `AspectContext` 和 `AdviceChain`。

```ts
import { AdviceChain, Around, AspectContext } from '@decoraxios/ioc-aop';

class AuditAspect {
  @Around('UserService.save')
  aroundSave(context: AspectContext, chain: AdviceChain) {
    console.log('around before', context.methodName);
    const result = chain.proceed(context);
    console.log('around after');
    return result;
  }
}
```

它适合做耗时统计、日志包裹、结果包装和自定义错误流转。

## `@AfterReturning`

只在目标方法成功返回时执行，第二个参数就是返回值。

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

只在目标方法抛错或 Promise reject 时执行，第二个参数是错误对象。

```ts
import { AfterThrowing, AspectContext } from '@decoraxios/ioc-aop';

class AuditAspect {
  @AfterThrowing('UserService.save')
  afterThrowing(context: AspectContext, error: unknown) {
    console.error('save failed', context.methodName, error);
  }
}
```

## 组合示例

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
    console.log('around before');
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
