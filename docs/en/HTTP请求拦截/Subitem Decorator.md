# Child Decorators

## Introduction

To make configurations more concise, `axios-plus` provides child decorators specifically for `mock` functionality. You can use the `@Mock` decorator to configure mock-related settings. This decorator accepts two parameters:

1. The first parameter is `handlers`, which can be either a handler function or an object:

```ts
// Using a single handler function
@Mock(async ({ request, params }) => {
  return HttpResponse.json({
    data: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });
})

// Or using a handlers object
@Mock({
  default: async ({ request, params }) => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    });
  },
  success: async ({ request, params }) => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    });
  },
})
```

2. The second parameter is the mock configuration object (`MockConfig`):

```ts
export type MockConfig = {
  /**
   * Whether to enable mock
   * @description When enabled, if conditions are met, all requests will go through the mock interface
   */
  on?: boolean;
  /**
   * Condition for using mock
   * @description After enabling mock, to avoid changing the original code, we can set conditions for using the real interface
   */
  condition?: () => boolean;
  /**
   * Operation count
   * @description Number of mock calls. After the interface has been mocked the specified number of times, it will no longer access the mock interface
   */
  count?: number;

  /**
   * Signal to cancel mock
   * @description Different from condition, this can dynamically cancel mock
   */
  signal?: Signal;
};
```

## Priority and Merge Strategy

The `handlers` defined in `@Mock` will be merged with the `handlers` from HTTP decorators like `@Get`. The priority of `@Mock`'s `handlers` is **lower** than that of the HTTP decorators' `handlers`. This means that if the same `handlers` are defined in both `@Mock` and an HTTP decorator like `@Get`, the handlers from the HTTP decorator will take precedence, and the handlers from the `@Mock` decorator will not take effect.
