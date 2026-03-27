# IoC / AOP

`@decoraxios/ioc-aop` 为类式应用提供轻量级容器和切面系统。

## 安装

```bash
npm install @decoraxios/ioc-aop reflect-metadata
```

在装饰器执行前先加载一次 `reflect-metadata`：

```ts
import 'reflect-metadata';
```

## `@Component`

`@Component` 用于把类注册进容器。

### 默认注册

不传参数时，Decoraxios 会使用默认模块，并根据类名生成别名。

```ts
import { Component } from '@decoraxios/ioc-aop';

@Component()
class UserService {}
```

`UserService` 默认会以 `userService` 这个别名注册。

### 字符串形式

字符串形式支持两种写法：

- 仅别名，例如 `'logger'`
- `module.alias`，例如 `'admin.logger'`

```ts
@Component('admin.logger')
class LoggerService {}
```

### 对象形式

当你想显式指定模块和别名时，使用对象形式：

```ts
@Component({
  module: 'admin',
  alias: 'logger',
})
class LoggerService {}
```

## `@Inject`

`@Inject` 用于把依赖注入到属性上。

### 空参数形式

不传参数时，会依赖属性的反射类型自动解析：

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

这种写法要求开启 `emitDecoratorMetadata: true`。

### 构造函数形式

```ts
@Component()
class UserService {
  @Inject(LoggerService)
  logger!: LoggerService;
}
```

### 字符串形式

可以直接写别名，或者 `module.alias`：

```ts
class UserService {
  @Inject('admin.logger')
  logger!: LoggerService;
}
```

### 配置对象形式

对象形式支持：

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

### 作用域

可选作用域：

- `SINGLETON`：复用同一个实例
- `TRANSIENT`：每次注入都创建新实例，默认值
- `PROTOTYPE`：以已有实例为原型创建新对象
- `SHALLOWCLONE`：对已有实例做浅拷贝
- `DEEPCLONE`：对已有实例做深拷贝

## `@Aspect`

`@Aspect(order)` 用于注册切面类。`order` 越小，执行顺序越靠前。

```ts
import { Aspect } from '@decoraxios/ioc-aop';

@Aspect(1)
class AuditAspect {}
```

## 切点表达式

通知装饰器接收切点表达式字符串。

常见写法：

- `UserService.save`
- `UserService.*`
- `*.save`
- `*.*`

类名和方法名都支持通配符匹配。

## `@Before`

在目标方法执行前运行：

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

在目标方法结束后运行，不区分成功或失败：

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

包裹目标方法执行，并接收 `AspectContext` 与 `AdviceChain`：

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

适合做计时、链路追踪、返回值包装或自定义异常流转。

## `@AfterReturning`

仅在目标方法成功返回时执行，返回值会作为第二个参数传入：

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

仅在目标方法抛错或拒绝时执行，异常对象会作为第二个参数传入：

```ts
import { AfterThrowing, AspectContext } from '@decoraxios/ioc-aop';

class AuditAspect {
  @AfterThrowing('UserService.save')
  afterThrowing(context: AspectContext, error: unknown) {
    console.error('save failed', context.methodName, error);
  }
}
```

## 综合示例

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
