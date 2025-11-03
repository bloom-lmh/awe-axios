# 注册类实例

## 介绍

`axios-plus`实现了依赖注入(`DI`)思想进行了实现，通过 `@Component` 装饰器，你可以把你要的类实例注册到容器中从而实现控制反转（`IOC`）。这样，你可以在其他类中通过 `@Inject` 装饰器注入你注册的类实例，实现解耦和可测试。

## 多种注册方式

类实例的注册主要通过 `@Component` 装饰器来实现，并提供了多种注册方式：

### 指定模块和别名

在将类实例注入容器时，你可以提供`module`和`alias`参数，指定模块名和别名，模块名其实就是充当命名空间的作用，主要防止在`monorepo`架构中不同模块出现同名类名冲突。如下所示：

```typescript {4-7}
import { Component } from './core/ioc';

// 自定义模块和别名
@Component({
  module: 'service', // 模块名
  alias: 'userApi', // 别名
})
class UserService {
  // ...
}
```

如果你不提供任何配置参数，实例类会默认注册到名为`__default__`的模块，并以类名首字母小写的形式作为别名。

```typescript
import { Component } from './core/ioc';

// 默认注册等价于 @Component({ module: '__default__', alias: 'userService' })
@Component()
class UserService {
  // ...
}
```

### 字符串表达式注册

`axios-plus`也支持通过字符串表达式快速配置（格式：`模块.别名`）：

```typescript {1-2}
// 等价于 { module: 'service', alias: 'userApi' }
@Component('service.userApi')
class UserService {
  // ...
}
```

当然你也可以只提供别名，这样模块名默认为`__default__`：

```typescript {1-2}
// 等价于 { module: '__default__', alias: 'userService' }
@Component('userService')
class UserService {
  // ...
}
```

### 默认注册

当然，你也可以不提供任何配置参数，这样实例类会默认注册到名为`__default__`的模块，并以类名首字母小写的形式作为别名，但是这样你需要承担命名冲突的风险：

```typescript
import { Component } from './core/ioc';

// 默认注册：模块为__default__，别名为"userService"
@Component
class UserService {
  getUser() {
    return { id: 1, name: 'test' };
  }
}
```

## 限制

### 同一模块下类名排他性

`axios-plus`的容器是基于模块命名空间的，不同模块可以存在同名类或别名，但是同一模块下不允许出现两个有相同别名和类名的类实例。比如：

```ts
@Component('userApi')
class UserApi {}
@Component('userApi')
class UserApi2 {}
```

这样会报错：`Instance with alias or ctor or ctorName already exists in module`

### 只能用于 ts 类

`axios-plus`是基于 typescript 开发的，所以只能用于 typescript 类，如果你使用其他语言，比如 `javascript`，就无法使用`axios-plus`了。当然我们也期待`javascript`原生能支持这种装饰器语法功能
