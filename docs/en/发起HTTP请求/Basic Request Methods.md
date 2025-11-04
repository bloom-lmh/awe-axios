# HTTP Request Methods

`awe-axios` encapsulates common HTTP request methods and provides them in the form of decorators for quickly defining API interfaces. These mainly include:

- Class Decorator: `@HttpApi`
- Method Decorators: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`

## @HttpApi

`@HttpApi` is a class-level decorator. A class decorated with `@HttpApi` is considered an `HTTP` API class. As shown below:

```ts
/**
 * Indicates that UserApi is an HTTP API class, and the base path for its interfaces is http://localhost:3000/api/users
 */
@HttpApi('http://localhost:3000/api/users')
class UserApi {}
```

This decorator defines the base configuration for the API interface class, serving as the common configuration for all request methods within the class. The configuration options supported by `@HttpApi` (of type `HttpApiDecoratorConfig`) are as follows:

| Option     | Type            | Description                                                                                                                                                     |
| ---------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL`  | `string`        | The base request URL, which will be concatenated with the method decorator's `url`.                                                                             |
| `url`      | `string`        | A relative path prefix, uniformly prepended to the method paths.                                                                                                |
| `refAxios` | `AxiosInstance` | A custom axios instance; all methods in the class use this instance by default.                                                                                 |
| `mock`     | `Object`        | Global mock configuration<br>- `on`: Whether to enable mock (boolean)<br>- `condition`: Condition for triggering the real interface (function, returns boolean) |

Usage example:

```typescript
import { HttpApi, Get } from 'awe-axios';

// Basic usage: specify baseURL
@HttpApi('https://api.example.com')
class UserApi {
  @Get('/users')
  getUserList(): any {} // Actual request URL: https://api.example.com/users
}

// Full configuration
@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/v1', // Path prefix
})
class UserApiV1 {
  @Get('/users')
  getUserList(): any {} // Actual request URL: https://api.example.com/v1/users
}

const api = new UserApiV1();
const { data } = await api.getUserList();
```

::: tip Configuration Merge Rules

When the class decorator (`@HttpApi`) and method decorator (e.g., `@Get`) have the same configuration, the method-level configuration takes precedence. Additionally, certain configurations are merged using specific strategies, as shown below:

1.  `baseURL`: Method decorator configuration overrides the class decorator.
2.  `url`: The class decorator's `url` and the method decorator's `url` are automatically concatenated (handling slashes).
3.  `headers`: Both are deeply merged, with method decorator configuration taking precedence.
4.  `refAxios`: Method decorator configuration overrides the class decorator.

This design allows defining common configurations at the class level while flexibly adjusting for specific needs at the method level. For details, please refer to /en/sending-http-requests/child-decorators.

:::

## @Get

`@Get` is a method-level decorator used to define a `GET` request interface. Interfaces defined with this decorator send requests using the `GET` method by default. Basic usage is as follows:

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  // Only specify the path
  @Get('/users')
  getUserList(): any {}

  // With path parameter
  @Get('/users/:id')
  getUserDetail(): any {}
}
```

The configuration options supported by `@Get` (of type `HttpMethodDecoratorConfig`) inherit from `axios` configurations and extend with enhanced features:

| Category          | Option              | Description                                                                                                                        |
| ----------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Basic Config      | `url`               | Request path (string or template with path parameters).                                                                            |
|                   | `baseURL`           | Overrides the class decorator's `baseURL`.                                                                                         |
|                   | `headers`           | Request headers.                                                                                                                   |
|                   | `timeout`           | Timeout duration (milliseconds).                                                                                                   |
|                   | `transformRequest`  | Request data transformer.                                                                                                          |
|                   | `transformResponse` | Response data transformer.                                                                                                         |
|                   | `...`               | You can enjoy all `axios` configuration options. For other `axios` supported options, please refer to the https://axios-http.com/. |
| Enhanced Features | `retry`             | Retry configuration (count or detailed configuration object).                                                                      |
|                   | `debounce`          | Debounce configuration (delay time or detailed configuration object).                                                              |
|                   | `throttle`          | Throttle configuration (interval time or detailed configuration object).                                                           |
|                   | `mock`              | Method-level `mock` configuration (overrides global configuration).                                                                |
|                   | `refAxios`          | Overrides the class decorator's default `axios` instance.                                                                          |

::: tip Path Parameters
Typically, you need to use various parameter decorators to implement more complex API interfaces. awe-axios provides three types of parameter decorators to meet your parameter passing needs:

1.  `@QueryParam`: For query parameters (`?key=value`).
2.  `@PathParam`: For path parameters (`/path/:id`).
3.  `@BodyParam`: For request body parameters (`application/json` or `x-www-form-urlencoded`).

As shown below:

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  @Get('/users/:id')
  getUserDetail(@PathParam('id') id: string): any {}
}
```

Path parameters (like `:id`) are automatically replaced with actual values and added to the request path. For specific usage of parameter decorators, please refer to /en/sending-http-requests/parameter-decorators.

:::

## @Post

`@Post` is used to define POST requests. Its configuration options are the same as `@Get`. The main difference is that it sends request body data by default. Usage is as follows:

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  @Post('/users')
  createUser(@BodyParam() user: { name: string; age: number }) {}

  // Other POST examples...
}
```

::: warning Notes on Request Retry
The configuration options for `@Post` are almost identical to `@Get`. You can set enhanced features like retry and debounce as needed. However, note that request retry for `POST` requests carries risks; use it cautiously. Also, certain encapsulated features have usage categories. For example, `@Debounce` is typically not used together with `@Throttle`. For details, please refer to /en/sending-http-requests/common-features.
:::

## @Put, @Delete, @Patch

These decorators are used similarly to `@Get` and `@Post`. They correspond to the HTTP standard methods `PUT`, `DELETE`, and `PATCH`, used for resource updating, deletion, and partial updates, respectively. Usage examples:

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  // Update resource (full update)
  @Put('/users/{id}')
  updateUser() {}

  // Delete resource
  @Delete('/users/{id}')
  deleteUser() {}

  // Partially update resource
  @Patch('/users/{id}')
  patchUser() {}
}
```

## @Options, @Head

- `@Options`: Used to request the HTTP methods supported by the server (commonly used for CORS preflight requests).
- `@Head`: Similar to `@Get`, but only returns response headers, not the response body.

Usage examples:

```typescript
@HttpApi('https://api.example.com')
class ResourceApi {
  // Check methods supported by the server
  @Options('/users')
  checkUserOptions() {}

  // Get resource header information
  @Head('/users')
  getUserHeaders() {}
}
```
