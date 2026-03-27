# HTTP Decorators

This page covers the core declaration decorators:

- `@HttpApi`
- `@Get`
- `@Post`
- `@Put`
- `@Delete`
- `@Patch`
- `@Options`
- `@Head`
- `@PathParam`
- `@QueryParam`
- `@BodyParam`

## `@HttpApi`

`@HttpApi` is the class decorator that defines shared request configuration. It accepts four shapes:

- Absolute URL string
- Relative URL string
- `AxiosInstance`
- `HttpApiConfig` object

### Absolute URL string

When you pass an absolute URL string, Decoraxios stores it as `baseURL`.

```ts
@HttpApi('https://api.example.com')
class UserApi {}
```

### Relative URL string

When you pass a relative string, it becomes the class-level path prefix.

```ts
@HttpApi('/users')
class UserApi {}
```

Use this shape when your axios instance already provides an absolute `baseURL`.

### Axios instance

Passing an axios instance is equivalent to class-level `refAxios`.

```ts
import axios from 'axios';
import { HttpApi } from 'decoraxios';

const request = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

@HttpApi(request)
class UserApi {}
```

### Config object

Use the config object when you need shared headers, params, transforms, plugins, or a path prefix.

```ts
@HttpApi({
  baseURL: 'https://api.example.com',
  url: '/users',
  timeout: 5000,
  headers: {
    'X-App': 'admin-console',
  },
  params: {
    locale: 'en-US',
  },
})
class UserApi {}
```

## HTTP method decorators

Decoraxios provides one decorator per HTTP verb:

- `@Get`
- `@Post`
- `@Put`
- `@Delete`
- `@Patch`
- `@Options`
- `@Head`

Each decorator accepts either:

- A string shorthand, interpreted as `url`
- A full `HttpMethodConfig`, which mirrors `AxiosRequestConfig` and adds runtime-specific fields such as `refAxios` and `plugins`

### Method decorator catalog

```ts
class UserApi {
  @Get('/users')
  listUsers() {
    return undefined as never;
  }

  @Post('/users')
  createUser() {
    return undefined as never;
  }

  @Put('/users/:id')
  replaceUser() {
    return undefined as never;
  }

  @Delete('/users/:id')
  removeUser() {
    return undefined as never;
  }

  @Patch('/users/:id')
  updateUser() {
    return undefined as never;
  }

  @Options('/users')
  options() {
    return undefined as never;
  }

  @Head('/users/:id')
  headUser() {
    return undefined as never;
  }
}
```

### String shorthand

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

### Full config object

```ts
@Get({
  url: '/search',
  timeout: 1500,
  headers: {
    'X-Trace': 'search',
  },
  params: {
    source: 'dashboard',
  },
})
searchUsers(@QueryParam('q') q: string): ApiCall<User[]> {
  return undefined as never;
}
```

### Configuration behavior

Class-level and method-level configuration are merged with these rules:

- Scalar fields such as `timeout`, `responseType`, and `baseURL` are overridden by the method config
- `headers` are shallow-merged
- `params` are shallow-merged, and `@QueryParam` values are applied on top
- `transformRequest` and `transformResponse` are appended
- `plugins` are appended

If neither the final `baseURL` nor the final `url` is absolute, Decoraxios throws at runtime because it cannot resolve a valid request target.

## `@PathParam`

`@PathParam(name)` replaces `:name` placeholders in the resolved URL.

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

If the value is `undefined` or `null`, the placeholder is left as-is. Values are URL-encoded before substitution.

## `@QueryParam`

`@QueryParam(name)` adds the argument value to the request query string.

```ts
@Get('/search')
search(
  @QueryParam('q') keyword: string,
  @QueryParam('page') page: number,
): ApiCall<User[]> {
  return undefined as never;
}
```

If the same query name is bound more than once, Decoraxios stores the values as an array.

```ts
@Get('/search')
search(
  @QueryParam('tag') first: string,
  @QueryParam('tag') second: string,
): ApiCall<User[]> {
  return undefined as never;
}
```

## `@BodyParam`

`@BodyParam()` binds request body data. It can be used unnamed or named.

### Unnamed body

Use the unnamed form when the whole argument should become the request body.

```ts
@Post('/')
createUser(@BodyParam() payload: CreateUserInput): ApiCall<User, CreateUserInput> {
  return undefined as never;
}
```

### Named body property

Use the named form when you want several arguments to compose one request body object.

```ts
@Post('/')
createUser(
  @BodyParam('name') name: string,
  @BodyParam('email') email: string,
): ApiCall<User> {
  return undefined as never;
}
```

### Body merge rules

Decoraxios resolves body arguments with these rules:

- If you only use one unnamed `@BodyParam()`, that value becomes `data`
- If you use multiple unnamed plain objects, they are shallow-merged
- If you use multiple unnamed non-object values, they become an array
- If you use named body parameters, they are merged into one object
- If you use named body parameters and unnamed plain objects together, the plain objects are merged first, then named properties override keys with the same name

Example:

```ts
@Post('/')
createUser(
  @BodyParam() base: { role: string },
  @BodyParam('name') name: string,
  @BodyParam('email') email: string,
): ApiCall<User> {
  return undefined as never;
}
```

This produces:

```ts
{
  role: 'admin',
  name: 'Ada',
  email: 'ada@example.com'
}
```

## Declaration pattern

Decoraxios does not call your original method body to build the request. Treat the method body as a type placeholder:

```ts
@Get('/:id')
getUser(@PathParam('id') id: string): ApiCall<User> {
  return undefined as never;
}
```

That keeps the class API expressive while the actual request configuration stays fully driven by decorators.
