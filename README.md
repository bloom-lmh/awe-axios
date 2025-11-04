# Awe-Axios

Note: The following is just a brief introduction. For details, please refer to the official documentation.
https://awe-axios.vercel.app/
https://aweaxios-758490sk.maozi.io/zh/%E8%B5%B7%E6%AD%A5/%E5%9F%BA%E6%9C%AC%E4%BB%8B%E7%BB%8D.html

## Basic Introduction

Awe-Axios is an enhanced HTTP request utility library based on Axios. It optimizes the request experience through the decorator pattern, configuration extensions, and more, while maintaining full compatibility with the Axios ecosystem. It supports core features such as annotation-driven development, request retransmission, debounce and throttle, Mock interception, aspect-oriented programming (AOP), and dependency injection (DI). It is suitable for various frontend HTTP request scenarios.

## Core Features

- **Annotation-Driven**: Define API interfaces through decorators; decorated methods are automatically proxied to request interfaces, simplifying configuration.
- **Encapsulated Functionality**: Built-in commonly used functions like request retransmission, debounce, and throttle, eliminating the need for repetitive development.
- **Non-Invasive Design**: Does not modify the original Axios API, compatible with existing Axios projects.
- **Real Mock Interception**: Implements network-level request interception based on MSW, supporting interface ambiguity (the same interface can be both a real and a Mock interface).
- **Aspect-Oriented Programming (AOP)**: Supports fine-grained interception at various stages like before/after request, success/failure.
- **Dependency Injection (DI)**: Provides an IoC container, supporting class instance registration and injection, decoupling component dependencies.
- **Multi-Environment Adaptation**: Supports custom Axios instances, adapting to backend services with different domains and authentication methods.

## Applicable Scenarios

1.  **Enterprise Application Development**: Centrally manage APIs through decorators, improving code maintainability.
2.  **High-Frequency Request Scenarios**: Debounce and throttle functions reduce invalid network requests and optimize performance.
3.  **Unstable Network Environments**: The request retransmission mechanism improves interface success rates.
4.  **Parallel Frontend/Backend Development**: Built-in Mock functionality allows development without waiting for backend interfaces.
5.  **Multi-Environment Switching**: Supports custom Axios instances, adapting to development, testing, production, and other environments.
6.  **Data Transformation Needs**: Provides request/response data converters for handling format conversion, encryption/decryption, etc.

## Quick Start

### Installation

```bash
# npm
npm install awe-axios --save

# yarn
yarn add awe-axios
```

### Environment Requirements

TypeScript development is required. Add the following configuration to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Basic Usage

```typescript
import { HttpApi, Get, Post, PathParam, BodyParam, QueryParam } from 'awe-axios';

@HttpApi({
  baseURL: 'http://localhost:3000/users',
})
class UserApi {
  // GET /users
  @Get('/')
  getAllUsers(): any {}

  // GET /users/:id (Retry 3 times on failure)
  @Get({
    url: '/:id',
    retry: 3,
  })
  getUserById(@PathParam('id') id: number): any {}

  // POST /users (Submit request body)
  @Post('/')
  addUser(@BodyParam() data: { name: string; age: number }): any {}

  // GET /users/page?page=xxx&size=xxx (Mock interface)
  @Get({
    url: '/page',
    mock: {
      handlers: () => {
        return HttpResponse.json({
          data: [1, 2, 3],
          total: 3,
        });
      },
    },
  })
  getPage(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}

// Usage example
const userApi = new UserApi();
const allUsers = await userApi.getAllUsers();
const user = await userApi.getUserById(1);
const newUser = await userApi.addUser({ name: 'test', age: 18 });
```

### Native Axios Usage

AxiosPlus is compatible with the native Axios API and can be called directly using `axiosPlus`:

```typescript
import { axiosPlus } from 'awe-axios';

// Request interceptor
axiosPlus.interceptors.request.use(config => {
  console.log('Request Interceptor', config);
  return config;
});

// Make a request directly
axiosPlus.get('http://localhost:3000/users');
```

## HTTP Request Methods

AxiosPlus provides class decorators and method decorators for quickly defining API interfaces.

### Class Decorator @HttpApi

Used to mark an HTTP interface class and define public configuration:

```typescript
import { HttpApi, Get } from 'awe-axios';

// Basic usage
@HttpApi('https://api.example.com')
class UserApi {
  @Get('/users')
  getUserList(): any {} // Actual request URL: https://api.example.com/users
}

// Complete configuration
@HttpApi({
  baseURL: 'https://api.example.com', // Base URL
  url: '/v1', // Path prefix
  refAxios: customAxiosInstance, // Custom Axios instance
  mock: {
    // Global Mock configuration
    on: true, // Whether to enable Mock
    condition: () => process.env.NODE_ENV === 'development', // Trigger condition
  },
})
class UserApiV1 {
  @Get('/users')
  getUserList(): any {} // Actual request URL: https://api.example.com/v1/users
}
```

#### Configuration Merge Rules

- `baseURL`: Method decorator configuration overrides class decorator.
- `url`: Class decorator URL and method decorator URL are automatically concatenated (handles slashes).
- `headers`: Deep merge, method decorator configuration takes priority.
- `refAxios`: Method decorator configuration overrides class decorator.

### Method Decorators

Covers all standard HTTP methods. Configuration items inherit from Axios and extend enhanced functionality:

| Decorator  | Description                | Applicable Scenarios                    |
| :--------- | :------------------------- | :-------------------------------------- |
| `@Get`     | Defines a GET request      | Query resources                         |
| `@Post`    | Defines a POST request     | Create resources (note idempotency)     |
| `@Put`     | Defines a PUT request      | Fully update resources                  |
| `@Delete`  | Defines a DELETE request   | Delete resources                        |
| `@Patch`   | Defines a PATCH request    | Partially update resources              |
| `@Options` | Defines an OPTIONS request | CORS preflight, query supported methods |
| `@Head`    | Defines a HEAD request     | Get response headers (no body)          |

#### Example: @Post Usage

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  @Post('/users')
  createUser(@BodyParam() user: { name: string; age: number }) {}
}
```

#### Enhanced Function Configuration

Method decorators support enhanced configurations like retry, debounce, throttle:

```typescript
@Get({
  url: '/data',
  retry: 3, // Retry 3 times
  debounce: 300, // Debounce 300ms
  throttle: 1000, // Throttle 1s
  mock: {} // Mock configuration
})
getData(): any {}
```

## Parameter Decorators

Used to handle request parameters, supporting query parameters, path parameters, and request body parameters:

### @QueryParam

Converts parameters into query string (`?key=value`):

```typescript
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get('/pages')
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}

// Call: userApi.getUserPages(1, 20)
// Final URL: http://localhost:3000/users/pages?page=1&size=20
```

#### Multi-parameter Merge

Parameters with the same name are automatically merged into an array:

```typescript
@Get('/groups')
getUserGroups(
  @QueryParam('ids') id1: number,
  @QueryParam('ids') id2: number
): any {}

// Call: userApi.getUserGroups(1, 2)
// Final URL: http://localhost:3000/users/groups?ids[]=1&ids[]=2
```

### @PathParam

Replaces parameters with path placeholders (`/path/:id`):

```typescript
@Get('/:id')
getUserById(@PathParam('id') id: number): any {}

// Call: userApi.getUserById(1)
// Final URL: http://localhost:3000/users/1
```

### @BodyParam

Collects parameters as the request body (supports JSON, form-data, etc.):

```typescript
// Basic usage
@Post('/')
createUser(@BodyParam() user: { name: string; age: number }): any {}

// Multi-parameter merge
@Post('/')
createUser(
  @BodyParam('user') user: { name: string; age: number },
  @BodyParam('person') person: { sex: string }
): any {}
// Final request body: { "user": { "name": "test" }, "person": { "sex": "男" } }

// File upload (specify Content-Type)
@Post({
  url: '/upload',
  headers: { 'Content-Type': 'multipart/form-data' }
})
uploadFile(@BodyParam('file') file: FormData): any {}
```

## Common Functions Explained

### Request Retry

Automatically retries failed requests to improve success rate. Suitable for non-real-time interfaces.

#### Basic Usage

```typescript
import { useRetry } from 'awe-axios';

// Define interface
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get('/:id')
  getUserById(@PathParam('id') id: number): any {}
}

const userApi = new UserApi();
// Wrap the interface with retry functionality
const retryGetUser = useRetry(userApi.getUserById);
// Call (default: retry 3 times, base delay 100ms)
await retryGetUser(1);
```

#### Configuration Methods

```typescript
// Only specify retry count
const retryGetUser = useRetry(userApi.getUserById, 3);

// Complete configuration
const retryGetUser = useRetry(userApi.getUserById, {
  count: 3, // Retry count
  delay: 1000, // Base delay time (ms)
});

// Array format [count, delay]
const retryGetUser = useRetry(userApi.getUserById, [3, 1000]);
```

#### Features

- **Exponential Backoff Strategy**: Delay for the nth retry = delay \* 2^(n-1)
- **First retry has no delay**; delay is applied starting from the second retry.
- **Not recommended for POST requests** (may cause duplicate data submission).

### Debounce

Limits requests triggered multiple times in a short period, executing only the last one. Suitable for search boxes, frequent clicks, etc.

#### Basic Usage

```typescript
import { useDebounce } from 'awe-axios';

// Wrap the interface with debounce functionality
const debounceGetUser = useDebounce(userApi.getUserById, 300);

// Multiple calls in a short time, only the last one executes
debounceGetUser(1);
debounceGetUser(2);
debounceGetUser(3); // Only this one takes effect
```

#### Configuration Methods

```typescript
// Only specify delay time (ms)
const debounceGetUser = useDebounce(userApi.getUserById, 300);

// Complete configuration
const debounceGetUser = useDebounce(userApi.getUserById, {
  delay: 300, // Delay time
  immediate: true, // Whether to execute the first request immediately
});
```

### Throttle

Limits the execution frequency of requests, executing only once within a specified time interval. Suitable for scroll loading, real-time refresh, etc.

#### Basic Usage

```typescript
import { useThrottle } from 'awe-axios';

// Wrap the interface with throttle functionality (executes at most once per second)
const throttleGetUser = useThrottle(userApi.getUserById, 1000);

// Multiple calls in a short time, only the first call within 1s takes effect
throttleGetUser(1);
throttleGetUser(2); // Ignored
await delay(1000);
throttleGetUser(3); // Takes effect
```

### Function Combination

Supports combining multiple functions (Decorator Pattern):

```typescript
// Debounce + Retry (Search scenario)
const debounceRetryGet = useDebounce(useRetry(userApi.getUserById), 300);

// Throttle + Retry (Scroll loading scenario)
const throttleRetryGet = useThrottle(useRetry(userApi.getUserById), 1000);
```

#### Precautions

- Not recommended to use Debounce and Throttle simultaneously (conflicting strategies).
- Recommended combinations: Search (Debounce + Retry), Scroll loading (Throttle + Retry), Ordinary interfaces (Retry only).

## Sub-item Decorators

Used to split complex configurations for clearer code structure. Supports the following sub-item decorators:

### @RefAxios (Class Decorator)

Sets the default Axios instance for all interfaces in the class:

```typescript
const customAxios = axiosPlus.create({ baseURL: 'http://localhost:3000/users' });

@HttpApi()
@RefAxios(customAxios)
class UserApi {
  @Get('/pages')
  getUserPages(): any {} // Automatically uses the customAxios instance
}
```

### @AxiosRef (Method Decorator)

Sets the Axios instance for a single interface (priority higher than class configuration):

```typescript
class UserApi {
  @Get('/pages')
  @AxiosRef(customAxios)
  getUserPages(): any {}
}
```

### @TransformResponse

Sets the response data processor (consistent with Axios `transformResponse`):

```typescript
@Get('/pages')
@TransformResponse([
  // Step 1: Parse JSON and extract the data field
  data => JSON.parse(data).data,
  // Step 2: Process data
  data => data.map(user => ({ ...user, age: 18 }))
])
getUserPages(): any {}
```

### @TransformRequest

Sets the request data processor (consistent with Axios `transformRequest`):

```typescript
@Post('/')
@TransformRequest([
  // Step 1: Add extra fields
  data => ({ ...data, sex: '男' }),
  // Step 2: Convert to JSON string
  data => JSON.stringify(data)
])
createUser(@BodyParam() user: { name: string; age: number }): any {}
```

## Mock Interface Setup

Implements network-level request interception based on MSW, supporting interface ambiguity (the same interface can be both real and Mock).

### Basic Usage

```typescript
import { MockAPI, HttpResponse } from 'awe-axios';

// Enable global Mock
MockAPI.on();

@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    mock: ctx => {
      return HttpResponse.json({
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      });
    },
  })
  getUsers(): any {}
}

// Call the Mock interface (curried call)
const userApi = new UserApi();
const { data } = await userApi.getUsers()();
```

### Handler Function

Supports multi-state handlers (success/error, etc.):

```typescript
@Get({
  mock: {
    handlers: {
      success: ctx => HttpResponse.json({ data: [1, 2, 3] }),
      error: ctx => HttpResponse.error()
    }
  }
})
getUsers(): any {}

// Call the specified handler
await userApi.getUsers()('success'); // Success state
await userApi.getUsers()('error'); // Error state
```

#### Simplified Writing (mockHandlers)

```typescript
@Get({
  mockHandlers: {
    success: ctx => HttpResponse.json({ data: [1, 2, 3] }),
    error: ctx => HttpResponse.error()
  }
})
getUsers(): any {}
```

### Handler Parameters

Get request information through the `ctx` parameter:

```typescript
@Post('/pages/:page/:size')
@Mock({
  handlers: async ({ request, params, cookies }) => {
    // Get query parameters
    const url = new URL(request.url);
    const page = url.searchParams.get('page');

    // Get path parameters
    const { size } = params;

    // Get request body
    const body = await request.json();

    // Get Cookies
    const token = cookies.token;

    return HttpResponse.json({ page, size, body });
  }
})
getPages(): any {}
```

### Common HttpResponse Methods

| Method    | Description                                      | Example                                            |
| :-------- | :----------------------------------------------- | :------------------------------------------------- |
| `json()`  | Returns a JSON response (auto-sets Content-Type) | `HttpResponse.json({ data: [] }, { status: 200 })` |
| `error()` | Returns a network error                          | `HttpResponse.error()`                             |
| `text()`  | Returns a text response                          | `HttpResponse.text('success')`                     |
| `html()`  | Returns an HTML response                         | `HttpResponse.html('<h1>Hello</h1>')`              |

## Cancel Mock

Supports various ways to switch between real and Mock interfaces without modifying business code.

### Signal Mechanism

Dynamically cancel Mock via SignalController:

```typescript
// Create Mock controller
const mockCtr = new SignalController();

@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    mock: {
      signal: mockCtr.signal,
      handlers: () => HttpResponse.json({ data:
```
