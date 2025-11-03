# AxiosPlus - Comprehensive Documentation

## 1. What is AxiosPlus?

`AxiosPlus` is an enhanced HTTP request tool library extended from `axios`. It provides richer functionalities and more flexible usage through decorator patterns, configuration extensions, while maintaining compatibility with the axios ecosystem.

Core features include:

- **Annotation-driven**: Define API interfaces based on decorators, which are automatically proxied as request methods
- **Feature encapsulation**: Built-in common features like request retry, debounce, throttle, etc.
- **Non-intrusive design**: Compatible with original axios APIs for smooth migration
- **Powerful mock capability**: Implement network-level interception based on msw, supporting seamless switching between real/mock interfaces
- **Interface ambiguity**: The same interface can serve as both a real interface and a mock interface
- **Aspect-oriented programming**: Fine-grained control over request/response interception
- **Dependency injection**: Supports instance management and dependency injection for multi-environment configuration

## 2. Application Scenarios

`AxiosPlus` is suitable for various front-end applications that need to handle HTTP requests, especially:

1. **Enterprise-level application development**: Centrally manage API configurations through decorators to improve maintainability
2. **High-frequency request scenarios**: Optimize request performance using debounce and throttle
3. **Unstable network environments**: Improve success rates through request retry mechanisms
4. **Multi-environment adaptation**: Support custom axios instances to adapt to different back-end services
5. **Parallel front-end and back-end development**: Built-in mock function eliminates waiting for back-end interfaces
6. **Data transformation needs**: Provide convenient request/response data transformation capabilities

Supports Vue, React and other framework applications as well as native JavaScript projects.

## 3. Quick Start

### 3.1 Installation

```bash
# Using npm
npm install axios-plus --save

# Using yarn
yarn add axios-plus
```

### 3.2 Environment Requirements

Requires a TypeScript environment with the following configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 3.3 Basic Usage

```typescript
@HttpApi({
  baseURL: 'http://localhost:3000/users',
})
class UserApi {
  // Basic GET request
  @Get('/')
  getAllUsers(): any {}

  // GET request with path parameters, retry 3 times on failure
  @Get({
    url: '/:id',
    retry: 3,
  })
  getUserById(@PathParam('id') id: number): any {}

  // POST request
  @Post('/')
  addUser(@BodyParam() data: { name: string; age: number }): any {}

  // Request with mock functionality
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
```

## 4. Core Function Details

### 4.1 HTTP Request Methods

`AxiosPlus` provides a series of HTTP method decorators that inherit from axios configurations with extended functionalities:

#### 4.1.1 @Get Decorator

Basic usage:

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  // Only specify path
  @Get('/users')
  getUserList(): any {}

  // With path parameters
  @Get('/users/:id')
  getUserDetail(): any {}
}
```

Supported configuration items:
| Category | Configuration | Description |
|----------|---------------|-------------|
| Basic Configuration | `url` | Request path |
| | `baseURL` | Override class decorator's baseURL |
| | `headers` | Request header information |
| | `timeout` | Timeout in milliseconds |
| Enhanced Features | `retry` | Retry configuration |
| | `debounce` | Debounce configuration |
| | `throttle` | Throttle configuration |
| | `mock` | Method-level mock configuration |

#### 4.1.2 Parameter Decorators

Parameter decorators used with request methods:

1. **@QueryParam**: For query parameters (`?key=value`)
2. **@PathParam**: For path parameters (`/path/:id`)
3. **@BodyParam**: For request body parameters

**@BodyParam Example**:

```typescript
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Post('/')
  createUser(@BodyParam() user: { name: string; age: number }): any {}
}
```

File upload example:

```typescript
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Post({
    url: '/upload',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  uploadFile(@BodyParam('file') file: FormData): any {}
}
```

### 4.2 Common Features

#### 4.2.1 Request Retry

Adopts exponential backoff strategy, supporting automatic retry on failure:

```typescript
const userApi = new UserApi();

// Original request function
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
}

// Decorate as a request with retry functionality (3 retries by default)
const retryGetUserById = useRetry(getUserById);
await retryGetUserById(1);
```

#### 4.2.2 Debounce

Limits repeated requests within a short period, suitable for search scenarios:

```typescript
// Multiple calls within 100ms will only execute once
const debouncedGetUser = useDebounce(getUserById, 100);
```

Application scenarios:

- Search box input suggestions
- Requests triggered by window resizing
- Frequent button click scenarios

#### 4.2.3 Throttle

Controls request execution frequency, suitable for scroll loading scenarios:

```typescript
// Execute at most once within 100ms
const throttledGetUser = useThrottle(getUserById, 100);
```

Application scenarios:

- Loading more data on scroll
- Requests triggered by drag operations
- Real-time data refresh (e.g., dashboards)

#### 4.2.4 Feature Combination

Supports combining multiple features:

```typescript
// Throttle + retry function
const fn = useThrottle(useRetry(getUserById));
```

Recommended combinations:

- Search scenarios: `Debounce + Retry`
- Scroll loading: `Throttle + Retry`
- Regular interfaces: `Only Retry` (most scenarios)

### 4.3 Mock Functionality

`AxiosPlus` provides a convenient mock interface solution, supporting seamless switching between development/production environments.

#### 4.3.1 Basic Usage

```typescript
// Enable mock globally
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

// Call mock interface (curried call)
const userApi = new UserApi();
const { data } = await userApi.getUsers()();
```

#### 4.3.2 Multi-handler Support

```typescript
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    mock: {
      handlers: {
        success: ctx => {
          return HttpResponse.json({ data: [{ id: 1, name: 'Alice' }] });
        },
        error: ctx => {
          return HttpResponse.error();
        },
      },
    },
  })
  getUsers(): any {}
}

// Call specified handler
const { data } = await userApi.getUsers()('success');
```

#### 4.3.3 Handler Function Parameters

Getting query parameters:

```typescript
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    url: '/pages',
    mock: ({ request }) => {
      const url = new URL(request.url);
      const page = url.searchParams.get('page');
      const size = url.searchParams.get('size');
      return HttpResponse.json({
        data: [
          /* ... */
        ],
      });
    },
  })
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
```

Getting request body parameters:

```typescript
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Post({
    url: '/pages/:page/:size',
    mock: async ({ request }) => {
      const data = await request.json();
      const { page, size } = data;
      return HttpResponse.json({
        data: [
          /* ... */
        ],
      });
    },
  })
  getUserPages(@BodyParam() qo: { page: number; size: number }): any {}
}
```

#### 4.3.4 HttpResponse Methods

- `HttpResponse.json()`: Returns JSON response
- `HttpResponse.text()`: Returns text response
- `HttpResponse.html()`: Returns HTML response

### 4.4 Aspect-Oriented Programming (AOP)

Intercept at stages like before request, after request, request error, etc., through decorators such as `@Before` and `@After`.

#### 4.4.1 Pointcut Expressions

Strings specifying the cut-in position, supporting wildcard `*`:

1. `getUser*`: All methods starting with `getUser`
2. `UserApi.getUser*`: All methods starting with `getUser` in `UserApi` class
3. `UserApi.*`: All methods in `UserApi` class
4. `*`: All methods

#### 4.4.2 Cut-in Timing

- `@Before`: Before method execution
- `@After`: After method execution (regardless of success or failure)
- `@Around`: Around method execution (can control whether to continue execution)
- `@AfterReturning`: After successful method execution
- `@AfterThrowing`: After method throws an exception

#### 4.4.3 Example

```typescript
@Component()
@HttpApi('http://localhost:3000/api/users')
class UserApi {
  @Get({
    url: '/pages',
    mock: () => {
      return HttpResponse.json({ data: 'hello world' });
    },
  })
  getUserPages(): any {}
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
}
```

### 4.5 Sub-item Decorators

Sub-item decorators separate configurations from the main decorator for clearer code structure.

#### 4.5.1 @TransformResponse

Used to process response data:

```typescript
@HttpApi({
  refAxios: request,
})
class UserApi {
  @Get({ url: '/pages' })
  @TransformResponse([data => JSON.parse(data).data, data => data.map((user: any) => ({ ...user, age: 12 }))])
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
```

#### 4.5.2 Configuration Priority

Configuration in `@Get` > Configuration in `@AxiosRef` decorator > Configuration in `@HttpApi` decorator > Configuration in `@RefAxios` decorator

### 4.6 Dependency Injection (DI)

Implemented through `@Inject` decorator and IoC (Inversion of Control) container, used to decouple dependencies between components and automatically manage instance creation and injection.

### 4.7 Encapsulating Decorators

You can encapsulate custom decorators for configuration reuse:

```typescript
// Encapsulate file upload post
function FileUp(config: HttpMethodDecoratorConfig) {
  config.headers = {
    'Content-Type': 'multipart/form-data',
  };
  return Post(config);
}

// Only get data part of response data
function ExtractData() {
  return TransformResponse(() => (data: any) => data.data);
}

// Usage
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @FileUp({ url: '/upload' })
  @ExtractData()
  avaterUpload(@BodyParam() form: FormData): any {}
}
```

## 5. Combining with Data Generation Tools

Combining with `data-faker-plus` can generate mock data more efficiently.

### 5.1 Project Structure

```bash
project
 ├── api
 │   ├── common
 │   │   └── index.ts      # Common interface decorators
 │   └── userApi.ts        # Real interface class
 └── mock
     ├── common
     │   └── index.ts      # Common methods
     ├── models
     │   └── userModel.ts  # Define data models
     └── userMock.ts       # Encapsulate user mock decorators
```

### 5.2 Define Data Models

```typescript
// /mock/models/userModel.ts
import { DataField, DataModel, defineModel, faker } from 'data-faker-plus';

@DataModel('user')
export class UserModel {
  @DataField('string.uuid')
  declare id: string;

  @DataField('person.firstName')
  declare firstName: string;

  @DataField('person.lastName')
  declare lastName: string;

  @DataField(['number.int', { min: 1, max: 120 }])
  declare age: number;

  // More fields...
}
```

### 5.3 Encapsulate Mock Decorators

```typescript
// /mock/userMock.ts
import { HttpResponse, Mock, MockHandlers } from '@/index';
import { fakeData, useModel } from 'data-faker-plus';
import { UserModel } from './models/userModel';

// Generate fake data
const users = fakeData(useModel(UserModel), 30);

// Simulate user pagination query
export function MockUserPages() {
  let handlers = {
    default: () => {
      return HttpResponse.json({
        message: 'success',
        data: users,
      });
    },
    error: () => HttpResponse.error(),
  };
  return Mock(handlers);
}
```

### 5.4 Define Real Interface Class

```typescript
// /api/userApi.ts
import { Delete, Get, Post } from '@/core/httpMethod';
import { HttpApi } from '@/core/ioc';
import { BodyParam, PathParam } from '@/core/params';
import { MockUserPages, MockUserDelete } from '../mock/userMock';

@HttpApi({
  baseURL: 'http://localhost:3000/api/users',
  mock: {
    on: true,
    condition: () => process.env.NODE_ENV === 'test',
  },
})
class UserApi {
  @Get('/pages/:page/:size')
  @MockUserPages()
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}

  @Delete('/:id')
  @MockUserDelete()
  deleteUser(@PathParam('id') id: number): any {}
}
```

## 6. License

MIT
