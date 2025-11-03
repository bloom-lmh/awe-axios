# Aspect-Oriented Programming (AOP)

## Basic Concepts

`axios-plus` also implements Aspect-Oriented Programming (AOP) functionality. Through decorators like `@Before`, `@After`, etc., you can intercept requests before execution, after execution, on errors, and other stages, and process the requests accordingly.

## Aspect Classes

Use `@Aspect` to define an aspect class. Methods within an aspect class can influence the target method at different execution stages. Define an aspect class as follows:

```typescript {1-2}
// Define an aspect class
@Aspect()
class Logger {
  @Before('getUser*')
  log(ctx: AspectContext) {
    console.log('before getUser*');
  }
}
```

## Pointcut Expressions

> The core of AOP lies in specifying _which methods_ and at _which execution stages_ to intercept. These methods are the join points (or interception points), which are represented using pointcut expressions.

A pointcut expression is essentially a string that specifies the interception location. The syntax is: `[moduleName].[className].(methodName)`, and these strings support using `*` as a wildcard for any characters. For example:

1.  `getUser*`: All methods starting with `getUser`
2.  `UserApi.getUser*`: All methods in the `UserApi` class starting with `getUser`
3.  `UserApi.getUserById`: The `getUserById` method in the `UserApi` class
4.  `UserApi.*`: All methods in the `UserApi` class
5.  `user.UserApi.getUserById`: The `getUserById` method in the `UserApi` class within the `user` module
6.  `*`: All methods

::: tip Cache Optimization
`axios-plus` caches used pointcut expressions using memoization to avoid repeated execution and improve performance.
:::

## Advice Types (When to Intercept)

Advice types define _when_ the interception occurs, for example:

### @Before

The `@Before` decorator is used to intercept before the method is called.

```ts {3-6}
@Aspect(1)
class Logger {
  @Before('getUser*')
  log(ctx: AspectContext) {
    // Print 'before getUser*' before the method is called
    console.log('before getUser*');
  }
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages()();
console.log(data);
```

### @After

The `@After` decorator is used to intercept after the method has been called (regardless of success or failure).

```ts {3-6}
@Aspect(1)
class Logger {
  @After('getUser*')
  logAfter(ctx: AspectContext) {
    console.log('after getUser*');
  }
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages()();
console.log(data);
```

### @Around

The `@Around` decorator is used to intercept both before and after the method call. It gives you full control over the method execution.

```ts {3-9}
@Aspect(1)
class Logger {
  @Around('getUser*')
  logAround(ctx: AspectContext, adviceChain: AdviceChain) {
    console.log('around before getUser*');
    const result = adviceChain.proceed(ctx); // Manually proceed to the target method
    console.log('around after getUser*');
    return result;
  }
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages()();
console.log(data);
```

::: warning Important Notes

1.  The `@Around` decorator **must have a return value**, otherwise an error will occur.
2.  You **must call** `adviceChain.proceed(ctx)` to manually advance the execution chain; otherwise, the target method will not be executed.

:::

### @AfterReturning

The `@AfterReturning` decorator is used to intercept after a method successfully returns. It can access the method's return value for processing.

```ts
@Aspect(1)
class Logger {
  @AfterReturning('getUser*')
  logAfterReturning(ctx: AspectContext, result: any) {
    console.log(result); // Log the return value
    console.log('afterReturning getUser*');
  }
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages()();
console.log(data);
```

### @AfterThrowing

The `@AfterThrowing` decorator is used to intercept after a method call fails (throws an exception). It can access the error information for handling.

```ts
@Aspect(1)
class Logger {
  @AfterThrowing('getUser*')
  logAfterThrowing(ctx: AspectContext, error: any) {
    console.log('An error occurred:', error);
    console.log('afterThrowing getUser*');
  }
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages()();
console.log(data);
```

## Join Point Context Object

The Join Point Context object (`AspectContext`) in `axios-plus` is used to store information about the join point. It is the first parameter `ctx` in the advice methods above. It contains the following information:

```ts
export class AspectContext {
  /**
   * Original method (function)
   */
  method: Function;
  /**
   * 'this' context of the original method
   */
  target: any;
  /**
   * Arguments passed to the original method
   */
  args: any[];

  /**
   * Axios configuration object for the request
   */
  axiosConfig?: HttpRequestConfig;
}
```

Therefore, you can use `ctx.method`, `ctx.target`, `ctx.args`, and `ctx.axiosConfig` to get the original method, its `this` context, its arguments, and the axios configuration, respectively. This allows you to implement more precise interception logic.

## Reusable Pointcut Expressions

You might frequently use certain pointcut expressions. `axios-plus` supports providing reusable pointcut expressions. A reusable pointcut expression is simply a function that returns the pointcut expression string, as shown below:

```ts {1-3,6,10}
function reusableExp() {
  return 'getUser*';
}
@Aspect(1)
class Logger {
  @Before(reusableExp) // Use the function reference
  log(ctx: AspectContext) {
    console.log('before getUser*');
  }
  @After(reusableExp) // Reuse the same expression
  logAfter(ctx: AspectContext) {
    console.log('after getUser*');
    console.log(ctx.axiosConfig);
  }
}
@Component()
@HttpApi('http://localhost:3000/api/users')
class UserApi {
  @Post({
    url: '/pages',
    headers: {
      'Content-Type': 'application/json',
    },
    mock: async ({ request }) => {
      const data = await request.json();
      const { page, size } = data as { page: number; size: number };
      return HttpResponse.json({
        message: 'ok',
        data: { id: 1, name: '张三' },
      });
    },
  })
  getUserPages(@BodyParam() data: { page: number; size: number }): any {}
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages({ page: 1, size: 10 })();
console.log(data);
```

## Execution Order

### Advice Execution Order

The order in which different types of advice execute might be confusing. Let's look at an example:

```ts
@Component()
@HttpApi('http://localhost:3000/api/users')
class UserApi {
  @Get({
    url: '/pages',
    mock: () => {
      return HttpResponse.json({
        data: 'hello world',
      });
    },
  })
  getUserPages(): any {}
  // ... other methods
}
@Aspect(1)
class Logger {
  @Before('getUser*')
  log(ctx: AspectContext) {
    console.log('before getUser*');
  }
  @After('getUser*')
  logAfter(ctx: AspectContext) {
    console.log('after getUser*');
  }
  @Around('getUser*')
  logAround(ctx: AspectContext, adviceChain: AdviceChain) {
    console.log('around before getUser*');
    const result = adviceChain.proceed(ctx); // Proceeds to the next advice or the target method
    console.log('around after getUser*');
    return result;
  }
  @AfterReturning('getUser*')
  logAfterReturning(ctx: AspectContext, result: any) {
    console.log('result:', result);
    console.log('afterReturning getUser*');
  }
  @AfterThrowing('getUser*')
  logAfterThrowing(ctx: AspectContext, error: any) {
    console.log('afterThrowing getUser*');
  }
}
const userApi = new UserApi();
const { data } = await userApi.getUserPages()();
console.log(data);
```

The execution result of this example would be:

```
around before getUser*
before getUser*
// ... (Target method executes here, potentially returning a value or throwing an error)
after getUser*
result: { data: 'hello world' } // (if successful)
afterReturning getUser*
around after getUser*
```

Therefore, the general execution order for a single aspect is: `Around (before part) -> Before -> Target Method Execution -> After -> AfterReturning (if successful) / AfterThrowing (if error) -> Around (after part)`.

### Aspect Class Execution Order

When there are multiple aspect classes, `axios-plus` allows you to set a priority order for them using the parameter to `@Aspect()`. The default priority is 5. **A lower number indicates higher priority, meaning that aspect executes first**. If priorities are the same, the order is non-deterministic (random). If priorities are different, how do they execute? Let's look at the code below with two aspects having different priorities:

```ts {4,31} // Lines 4 and 31 show the priorities
function reusableExp() {
  return 'getUser*';
}
@Aspect(1) // Higher priority (executes first)
class Logger {
  @Before(reusableExp)
  log(ctx: AspectContext) {
    console.log('before getUser*');
  }
  @After(reusableExp)
  logAfter(ctx: AspectContext) {
    console.log('after getUser*');
  }
  @Around('getUser*')
  logAround(ctx: AspectContext, adviceChain: AdviceChain) {
    console.log('around before getUser* (Logger 1)');
    const result = adviceChain.proceed(ctx); // Hands over to the next aspect or the target method
    console.log('around after getUser* (Logger 1)');
    return result;
  }
  // ... other advices
}
@Aspect(2) // Lower priority (executes after Logger)
class Logger2 {
  @Before(reusableExp)
  log(ctx: AspectContext) {
    console.log('2before getUser*');
  }
  @After(reusableExp)
  logAfter(ctx: AspectContext) {
    console.log('2after getUser*');
  }
  @Around('getUser*')
  logAround(ctx: AspectContext, adviceChain: AdviceChain) {
    console.log('2around before getUser* (Logger 2)');
    const result = adviceChain.proceed(ctx); // Hands over to the next aspect or the target method
    console.log('2around after getUser* (Logger 2)');
    return result;
  }
  // ... other advices
}
// ... UserApi definition
const userApi = new UserApi();
const { data } = await userApi.getUserPages({ page: 1, size: 10 })();
console.log(data);
```

The execution order when there are multiple aspect classes with different priorities forms a nested structure, often called an "onion model":

1.  Higher priority aspect's `@Around` (before part) executes first.
2.  Then, within its `proceed()` call, the next highest priority aspect's `@Around` (before part) executes.
3.  This continues until all aspects' `@Around` (before parts) have executed.
4.  Then, all `@Before` advices execute (higher priority first).
5.  Then the target method executes.
6.  Then all `@After` advices execute (higher priority _last_? Actually, typically higher priority `@After` runs first after the method, but let's check the output pattern).
7.  Then `@AfterReturning`/`@AfterThrowing` execute.
8.  Then the `@Around` advices complete in reverse order (their "after" parts): lower priority aspect's `@Around` (after part) executes first, then the next, up to the highest priority aspect's `@Around` (after part) executing last.

Based on the described logic and common AOP patterns (like in Spring), the output for the example with two aspects (priority 1 and 2) would likely be:

```
around before getUser* (Logger 1 - High Priority)
2around before getUser* (Logger 2 - Lower Priority)
before getUser* (Logger 1 - High Priority)
2before getUser* (Logger 2 - Lower Priority)
// ... (Target method executes)
2after getUser* (Logger 2 - Lower Priority) // After advice often runs in reverse priority order
after getUser* (Logger 1 - High Priority)
// ... (AfterReturning if successful)
2around after getUser* (Logger 2 - Lower Priority) // Around 'after' runs in reverse order
around after getUser* (Logger 1 - High Priority)
```

The key concept is that `@Around` advice forms a nested structure, and `@Before`/`@After` advice are woven into this structure according to their priority. `@After` advice usually runs in the reverse order of `@Before` advice.
