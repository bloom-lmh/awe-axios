# Quick Start

## Installation

Install `awe-axios` using `npm` or `yarn`:

```bash
# Using npm
npm install awe-axios --save

# Using yarn
yarn add awe-axios
```

## Environment Requirements

Since `awe-axios` heavily utilizes decorator syntax, you need to develop with `TypeScript`. You must have a TypeScript environment set up in your project and add the following configurations to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Basic Usage

```typescript {6,10-13,17,21-31}
@HttpApi({
  baseURL: 'http://localhost:3000/users',
})
class UserApi {
  // Equivalent to axios.get('http://localhost:3000/users')
  @Get('/')
  getAllUsers(): any {}

  // Equivalent to axios.get(`http://localhost:3000/users/${id}`)
  // With 3 retry attempts on failure
  @Get({
    url: '/:id',
    retry: 3,
  })
  getUserById(@PathParam('id') id: number): any {}

  // Supports request body parameters
  @Post('/')
  addUser(@BodyParam() data: { name: string; age: number }): any {}

  // Can be defined as a mock endpoint
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

## Using Native Axios

If you need to use the native `axios` library, you can directly import `axiosPlus` and use it just like `axios`. Here's an example with interceptors:

```typescript
import { axiosPlus } from 'awe-axios';
axiosPlus.interceptors.request.use(config => {
  console.log('Request interceptor', config);
  return config;
});
```
