# Dependency Injection (DI)

## Core Concepts

In `awe-axios`, Dependency Injection (DI) is implemented through the `@Inject` decorator and an IoC (Inversion of Control) container, which decouples dependencies between components and automatically manages instance creation and injection. The following details the implementation and usage.

## Basic Usage

The `@Inject` decorator supports multiple configuration methods to meet various dependency lookup scenarios:

### String Expression Injection

Format: `[moduleName.]alias` (module name is optional, default module is `__default__`)

```typescript
// Inject "userService" from the default module
@Inject('userService')
private userService: UserService;

// Inject "productApi" from the "api" module
@Inject('api.productApi')
private productService: ProductService;
```

### Configuration Object Injection

You can also use a configuration object for injection lookup. The configuration object structure is:

```ts
type GetInstanceConfig = {
  /**
   * Module name
   */
  module?: string | symbol;
  /**
   * Alias
   */
  alias?: string;
  /**
   * Constructor (class)
   */
  ctor?: DecoratorClass;
  /**
   * Instance creation scope
   */
  scope: InstanceScope | string;
  /**
   * Backup instances
   */
  backups?: InjectBackups;
};
```

Example:

```typescript
// Lookup by class (most common, type-safe)
@Inject({ ctor: UserService })
private userService: UserService;

// Lookup by module + alias
@Inject({ module: 'api', alias: 'productApi' })
private productService: ProductService;
```

::: warning When both `ctor` and `alias` are configured
If you configure both `ctor` and `alias`, `awe-axios` will only use `module + ctor` for the lookup and ignore `alias`.
:::

::: tip About `scope` and `backups`

The `scope` configuration controls the creation strategy for dependency instances, with a default value of `SINGLETON`. The `backups` configuration specifies alternative instances. These will be explained in detail later.
:::

### Direct Constructor Injection

You can also pass the class directly as a parameter (equivalent to `{ ctor: Class }`):

```typescript
@Inject(UserService)
private userService: UserService;
```

<!-- ### Dependency Inference Mechanism

You can also configure nothing. `awe-axios` is intelligent enough to automatically infer the dependency type, as shown below:

```ts
@Inject()
private userService: UserService;
```

::: warning But there are prerequisites and risks

1.  `awe-axios` infers based on the property declaration type, such as the `UserService` type declared in `userService: UserService` in the example above. However, type inference is not always accurate, for example with the `typeof` keyword, `any` type, `unknown` type, etc. If you want to use this feature, you need to write precise type annotations to avoid potential type errors.
2.  Object-oriented languages often use polymorphism, meaning a class can have many subclasses. If you register multiple subclasses of a class (but the parent class is not registered), and you use the parent class type for injection, `awe-axios` will have multiple candidates (multiple subclass instances of the same kind) and cannot determine which specific subclass to inject. Therefore, if you use a property declared as a parent class, ensure that if multiple subclasses are registered, the parent class is also registered to create a best candidate (the parent class itself).

:::
-->

## Instance Scopes

`awe-axios` provides multiple instance injection modes during dependency injection, including Singleton, Transient, Prototype, Shallow Clone, etc., to meet the needs of different scenarios. The creation strategy is controlled by the `scope` configuration, with a default value of `SINGLETON`:

| Scope          | Description                                                                     | Suitable Scenarios                                                 |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `SINGLETON`    | Singleton pattern, globally unique instance                                     | Utility classes, configuration services                            |
| `TRANSIENT`    | Transient pattern, creates a new instance each time                             | Stateful objects, request context                                  |
| `PROTOTYPE`    | Prototype pattern, creates a new object based on the prototype instance         | Scenarios requiring inheritance from the original instance's state |
| `SHALLOWCLONE` | Shallow clone pattern, copies the top-level properties of the original instance | Quick copying of simple objects                                    |
| `DEEPCLONE`    | Deep clone pattern, completely copies the original instance                     | Independent copies of complex objects                              |

### Transient Scope

In Transient scope, a new instance is created each time it is injected. `awe-axios` uses Transient scope by default, as shown in the following example:

```typescript {4-11,14-15}
@Component()
class User {}
class UserService {
  @Inject(User)
  user1!: User;
  @Inject({
    module: '__default__',
    alias: 'user',
    scope: 'TRANSIENT',
  })
  user2!: User;
}
let userService = new UserService();
// Because Transient scope is used by default, the two injected user instances are different
console.log(userService.user1 === userService.user2); // false
```

### Singleton Scope

In Singleton scope, the same instance is returned each time it is injected, as shown in the following example:

```typescript {4-14,17-18}
@Component()
class User {}
class UserService {
  @Inject({
    ctor: User,
    scope: 'SINGLETON',
  })
  user1!: User;
  @Inject({
    module: '__default__',
    alias: 'user',
    scope: 'SINGLETON',
  })
  user2!: User;
}
let userService = new UserService();
// Because Singleton scope is used, the two injected user instances are the same
console.log(userService.user1 === userService.user2); // true
```

### Prototype Scope

In Prototype scope, a new instance is created each time, using the class instance as the prototype, as shown in the following example:

```ts {4-7,11-13}
@Component()
class User {}
class UserService {
  @Inject({
    ctor: User,
    scope: 'PROTOTYPE',
  })
  user1!: User;
}
let userService = new UserService();
// user1 has the User class instance as its prototype
console.log(userService.user1 instanceof User); // true
console.log(Object.getPrototypeOf(userService.user1)); // User {}
```

### Shallow Clone Scope

In Shallow Clone scope, a new instance is created each time, but only the top-level properties of the original instance are copied, as shown in the following example:

```ts {11-15,19-21}
@Component()
class User {
  obj: any = { a: 1 };
}
class UserService {
  @Inject({
    ctor: User,
    scope: 'SINGLETON',
  })
  user1!: User;
  @Inject({
    ctor: User,
    scope: 'SHALLOWCLONE',
  })
  user2!: User;
}
let userService = new UserService();
// Change property 'a' inside the 'obj' of user1
userService.user1.obj.a = 2;
// Because Shallow Clone is used, property 'a' inside the 'obj' of user2 also changes
console.log(userService.user2.obj.a); // 2
```

### Deep Clone Scope

In Deep Clone scope, a new instance is created each time, and all properties of the original instance are recursively copied, as shown in the following example:

```ts {11-15,19-21}
@Component()
class User {
  obj: any = { a: 1 };
}
class UserService {
  @Inject({
    ctor: User,
    scope: 'SINGLETON',
  })
  user1!: User;
  @Inject({
    ctor: User,
    scope: 'DEEPCLONE',
  })
  user2!: User;
}
let userService = new UserService();
// Change property 'a' inside the 'obj' of user1
userService.user1.obj.a = 2;
// Because Deep Clone is used, property 'a' inside the 'obj' of user2 remains unchanged
console.log(userService.user2.obj.a); // 1
```

## Dependency Backups

To ensure injection stability, `awe-axios` provides a dependency backup mechanism. When the primary instance lookup fails, alternative instances can be specified via the `backups` configuration. The `backups` configuration can be a constructor, an object, or an array of constructors and objects, as shown in the following example:

```typescript {8,13-14}
class User {
  obj: any = { a: 1 };
}
class Student {}
class UserService {
  @Inject({
    alias: 'person',
    backups: [User, Student],
    // or
    // backups: [new User(), new Student()]
    // or
    // backups: User
  })
  user1!: User;
}
let userService = new UserService();
// No 'person' instance exists, so the backup User class is used as the instance: User { obj: { a: 1 } }
console.log(userService.user1);
```

::: tip Backup Order
When there are multiple backup instances, `awe-axios` will try them in the order of registration until an instance is found. If none are found, `undefined` is injected.
:::
