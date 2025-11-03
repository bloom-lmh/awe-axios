# Disabling Mock

## Interface Duality

As mentioned earlier, in the world of `awe-axios`, an interface is both a real interface and a `mock` interface, much like wave-particle duality. Interfaces also exhibit this dual nature.

In previous chapters, we learned how to configure a real interface to become a `mock` interface. Now we will explain how to turn a `mock` interface back into a real one. `awe-axios` provides class methods to disable `mock` interfaces logically, as shown below:

::: tip About Disabling Mock Interfaces
Disabling a `mock` interface here means a logical cancellation. The same call will not go through the `mock` interface but will instead use the real interface. The purpose of this design is to make the code adhere to the Open/Closed Principle, allowing the interface usage mode to be switched via configuration without modifying the code.
:::

## Signal Mechanism

`awe-axios` adopts the signal mechanism from `axios`. In `awe-axios`, we can also configure a signal to logically disable the mock, as shown below:

```ts {1-2,24,26-28}
// Create a mock controller
const mockCtr = new SignalController();
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      signal: mockCtr.signal, // Configure the signal
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        // Parameters are 1, 10
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// Sends to the mock interface: http://localhost:3000/users/.../pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
// Disable mock (use the real interface)
mockCtr.abort();
// Sends to the real server interface: http://localhost:3000/users/pages/1/20
let { data: data2 } = await userApi.getUserPages(1, 20)();
```

In the example above, we configured a signal via `mockCtr.signal`. When `mockCtr.abort()` is called, `awe-axios` cancels the call to the `mock` interface, causing it to use the real interface instead.
:star: Therefore, when the backend interface is ready, you don't need to change the call to something like `userApi.getUserPagesReal(1, 20)`.

## Setting Mock Usage Count

Besides using signals to disable the `mock` interface, `awe-axios` also provides a mock count configuration. This means that after the `mock` interface has been called a specified number of times, it will be automatically disabled, and all subsequent calls will go to the real interface. What's the benefit? We can call the `mock` interface during the initial page load to display some fake data first, and then call the real interface after the data loading is complete, improving the user experience.

As shown below:

```ts {6,31}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      count: 3, // Mock will be used only 3 times
      handlers: async ({ request, params }) => {
        console.log('Mock interface called');
        console.log(request.url);
        const { page, size } = params;
        // Parameters are, e.g., 1, 10
        console.log(page, size);
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// Sends to mock interface (Count 1)
let { data: data1 } = await userApi.getUserPages(1, 10)();
// Sends to mock interface (Count 2)
let { data: data2 } = await userApi.getUserPages(1, 20)();
// Sends to mock interface (Count 3)
let { data: data3 } = await userApi.getUserPages(1, 30)();
// Mock count limit reached, use real interface
// Sends to real server interface
let { data: data4 } = await userApi.getUserPages(1, 40)();
// Sends to real server interface
let { data: data5 } = await userApi.getUserPages(1, 50)();
// Sends to real server interface
let { data: data6 } = await userApi.getUserPages(1, 60)();
```

## Mock Switch

Consider this scenario: during frontend-backend integration testing, we need to use fake data from the `mock` interface before the backend interface is developed. After the backend interface is ready, we turn off the `mock` interface to see the real data. We can achieve this by configuring the `mock` switch. `awe-axios` supports three levels of `mock` switch configuration: interface level, class level, and global level, with priority from high to low, as shown below:

### Enable/Disable at Interface Level

We can use the `on` property in the `mock` configuration to control whether an interface uses the `mock` interface. This allows you to disable a `mock` interface one by one as backend interfaces are completed, achieving method-level control. This has the highest priority.

```ts {6,22}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      on: false, // Mock is turned OFF for this specific interface
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// Because mock is disabled, it uses the real interface
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

::: tip Default Value
When you configure a `mock` interface, even if you don't configure the `on` property, it defaults to `true`. So, to disable the `mock` interface, you need to explicitly set `on: false`.
:::

### Enable/Disable at Class Level

In addition to the interface-level switch, `awe-axios` provides a class-level switch. This allows you to control whether to use `mock` interfaces for the entire class, enabling unified control of multiple `mock` interfaces by module (class). Its priority is lower than the interface-level switch but higher than the global-level switch.

```ts {3-5,26}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
  mock: {
    on: false, // Mock is turned OFF for all methods in this class
  },
})
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      // No 'on' property here, inherits from class level
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// Because mock is disabled at class level, it uses the real interface
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

### Enable/Disable Globally

As mentioned earlier, you can also turn the mock on/off globally using `MockAPI.on()` and `MockAPI.off()`. This has the lowest priority.

```ts {2,23}
test.only('mock switch', async () => {
  MockAPI.off(); // Turn off mock globally
  @HttpApi('http://localhost:3000/users/')
  class UserApi {
    @Get({
      url: '/pages/:page/:size',
      mock: {
        handlers: async ({ request, params }) => {
          const { page, size } = params;
          return HttpResponse.json({
            data: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          });
        },
      },
    })
    getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
  }
  let userApi = new UserApi();
  // Because mock is disabled globally, it uses the real interface
  let { data: data1 } = await userApi.getUserPages(1, 10)();
```

## Environment-Based Configuration

While the mock switch can explicitly control the enabling/disabling of mock interfaces, in actual development, we might need a tool that can intelligently control the use of mock interfaces based on different environments. For example, use the `mock` interface in the development environment, and use the real interface in the test/production environment. `awe-axios` provides environment-based configuration functionality. We can set conditions to switch between the mock interface and the real interface based on the environment. This means that even if you have the mock enabled, if the environment doesn't meet the mock condition, it will use the real interface instead. `awe-axios` offers three levels of environment configuration: interface level, class level, and global level, with priority from high to low.

### Interface-Level Environment Awareness

Achieve interface-level environment awareness through the `condition` configuration item.

```ts {6-9,25}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      condition: () => {
        // Use mock interface only in test environment
        return process.env.NODE_ENV === 'test';
      },
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// If it's the test environment, uses the mock interface
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

### Class-Level Environment Awareness

Class-level environment setting has lower priority than the interface level but higher than the global level.

```ts{4-7,29}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
  mock: {
    condition: () => {
      // Use mock interface only in test environment for this class
      return process.env.NODE_ENV === 'test';
    },
  },
})
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      // No condition here, inherits from class level
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// Uses the real interface if not in test environment
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

### Global Environment Awareness

Global environment setting has the lowest priority.

```ts {1-3,26}
MockAPI.setCondition(() => {
  return process.env.NODE_ENV === 'test'; // Set condition globally
});
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// Uses the real interface if the global condition is not met
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

:::tip Default Value
You actually don't need to set `process.env.NODE_ENV === 'test'` globally again, because `awe-axios` sets this as the default global condition.
:::
