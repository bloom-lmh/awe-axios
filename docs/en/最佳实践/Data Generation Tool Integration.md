# Integration with Data Generation Tools

This chapter will teach you how to integrate data generation tools to encapsulate custom decorators, making your code more concise and elegant, and use data generation tools to implement business `mock` functionality.

## Project Structure Preparation

```bash
project
 ├── api
 │   ├── common
 │   │   └── index.ts      # Common interface decorators
 │   └── userApi.ts        # Real interface classes
 └── mock
     ├── common
     │   └── index.ts      # Common methods
     ├── models
     │   └── userModel.ts  # Define data models
     └── userMock.ts       # Encapsulated user mock decorators
```

## Define Data Models

Data models are defined using `data-faker-plus` in `/mock/models/userModel.ts`

```ts
import { DataField, DataModel, defineModel, faker } from 'data-faker-plus';

// Define user data model
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
  @DataField(ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.lastName });
  })
  declare email: string;
  @DataField('phone.number')
  declare phone: string;
  @DataField('person.sex')
  declare sex: string;
}
```

::: tip data-faker-plus
I recommend using `data-faker-plus` for data simulation. For usage of `data-faker-plus`, please refer to:

1. https://www.npmjs.com/package/data-faker-plus
2. https://github.com/bloom-lmh/data-faker
3. https://datafaker-9j23z0sk.maozi.io/
4. https://df-docs-seven.vercel.app/
   :::

## Encapsulate Mock Decorators

### Define Common Methods

`/mock/common/index.ts` defines common error handling methods

```ts
/**
 * Common methods
 */

import { HttpResponse } from 'msw';

/**
 * Network error
 * @returns
 */
export function netWorkError() {
  return HttpResponse.error();
}
```

### Define User Mock Decorators

`/mock/userMock.ts` defines user-related `mock` decorators

```ts
import { HttpResponse, Mock, MockHandlers } from '@/index';
import { fakeData, useModel } from 'data-faker-plus';
import { UserModel } from './models/userModel';
import { netWorkError } from './common';

// Use data-faker-plus to generate fake data
const users = fakeData(useModel(UserModel), 30);
/**
 * Mock user pagination
 */
export function MockUserPages() {
  let handlers = {
    default: () => {
      return HttpResponse.json({
        message: 'success',
        data: users,
      });
    },
    error: netWorkError,
  };
  return Mock(handlers);
}

/**
 * Mock delete user
 */
export function MockUserDelete() {
  let handlers: MockHandlers = {
    default: ({ params }) => {
      // Get user parameters
      const { id } = params;
      // Find user
      const user = users.find((item: any) => item.id === id);
      // Delete user
      users.splice(users.indexOf(user), 1);
      // Return success message
      return HttpResponse.json({
        message: 'delete success',
      });
    },
    error: netWorkError,
  };
  return Mock(handlers);
}

/**
 * Mock update user
 */
export function MockUserUpdate() {
  // Success handler
  const success: MockHandlers = async ({ request }) => {
    // Get request body parameters
    let user = await request.json();
    user = JSON.parse(JSON.stringify(user)) as UserModel;

    if (!user || !user.id) {
      return HttpResponse.json({
        status: 400,
        message: 'params error',
      });
    }
    // Update user information
    const index = users.findIndex((item: any) => item.id === user.id);
    users[index] = user;
    return HttpResponse.json({
      message: 'update success',
    });
  };
  // Error handler
  const error = netWorkError;
  // Return Mock decorator
  return Mock({
    default: success,
    error,
  });
}

/**
 * Add user
 */
export function MockUserCreate() {
  // Success handler
  const success: MockHandlers = async ({ request }) => {
    // Get request body parameters
    let user = await request.json();
    // Add new user
    users.unshift(user);
    return HttpResponse.json({
      message: 'create success',
    });
  };
  // Error handler
  const error = netWorkError;
  // Return Mock decorator
  return Mock({
    default: success,
    error,
  });
}
```

## Encapsulate Interface Decorators

`/api/common/index.ts`

```ts
import { HttpMethodDecoratorConfig, Post } from '@/index';

/**
 * Pagination query decorator
 * @param config Request configuration
 * @returns Post decorator
 */
export function Pages(config: HttpMethodDecoratorConfig) {
  config.headers = {
    'Content-Type': 'application/json',
  };
  return Post(config);
}
```

## Define Real Interface Classes

`/api/userApi.ts`

```ts
import { Delete, Get, Post, Put } from '@/core/httpMethod';
import { HttpApi } from '@/core/ioc';
import { Pages } from './common';
import { BodyParam, PathParam } from '@/core/params';
import { MockUserCreate, MockUserDelete, MockUserPages, MockUserUpdate } from '../mock/userMock';

@HttpApi({
  baseURL: 'http://localhost:3000/api/users',
  mock: {
    on: true,
    condition: () => {
      return process.env.NODE_ENV === 'test';
    },
  },
})
class UserApi {
  /**
   * User pagination query interface
   * @param page Page number
   * @param size Page size
   */
  @Pages({ url: '/pages/:page/:size' })
  @MockUserPages()
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}

  /**
   * Delete user interface
   * @param id User ID
   */
  @Delete('/:id')
  @MockUserDelete()
  deleteUser(@PathParam('id') id: number): any {}

  /**
   * Add user interface
   */
  @Post('/')
  @MockUserCreate()
  addUser(@BodyParam() user: { name: string; age: number }): any {}

  /**
   * Update user interface
   */
  @Put('/')
  @MockUserUpdate()
  updateUser(@BodyParam() user: { id: number; name: string; age: number }): any {}
}

export const userApi = new UserApi();
```

## Test Interface Calls

Turn on the `mock` switch to test if the interfaces work properly

```ts
// Must enable mock switch first
MockAPI.on();
const { data } = await userApi.getUserPages(1, 10)();
console.log(data);
// Delete user
const { data: data2 } = await userApi.deleteUser(1)();
console.log(data2);
// Add user
const { data: data3 } = await userApi.addUser({ name: 'test', age: 18 })();
console.log(data3);
```
