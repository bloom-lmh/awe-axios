# Child Decorators

## Basic Introduction

`awe-axios` defines some child decorators. These decorators act like syntactic sugar, allowing users to configure things more conveniently. Let's look at an example:

```ts {7-16}
@HttpApi({
  refAxios: request,
})
class UserApi {
  @Get({
    url: '/pages',
    transformResponse: [
      data => {
        // handle1
        return data;
      },
      data => {
        // handle2
        return data;
      },
    ],
  })
  getUserPages(): any {}
}
```

As you can see, all our `http` request configuration items are placed within `@Get`, which can lead to very bloated configuration. Therefore, `awe-axios` defines some child decorators to make the configuration structure clearer. For example, below we use `@TransformResponse` to separate the response data processor from `@Get`:

```ts {11-22}
const request = axiosPlus.create({
  baseURL: 'http://localhost:3000/users/',
});
@HttpApi({
  refAxios: request,
})
class UserApi {
  @Get({
    url: '/pages',
  })
  @TransformResponse([
    data => {
      return JSON.parse(data).data;
    },
    data => {
      data = data.map((user: any) => {
        user['age'] = 12;
        return user;
      });
      return data;
    },
  ])
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
const { data } = await new UserApi().getUserPages(1, 3);
console.log(data);
```

In fact, `awe-axios` has other child decorators, such as: `@RefAxios`, `@AxiosRef`, etc.

## @RefAxios

This decorator is a class child decorator used to set the `axios` instance referenced by all `http` interfaces in this class. It accepts an `axios` instance object as a configuration item, as shown below:

```ts {12-13}
const request = axiosPlus.create({
  baseURL: 'http://localhost:3000/users/',
});
@HttpApi()
@RefAxios(request)
class UserApi {
  @Get({
    url: '/pages',
  })
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
// The final request URL is http://localhost:3000/users/pages?size=3&page=1
const { data } = await new UserApi().getUserPages(1, 3);
console.log(data);
```

::: tip Configuration Priority
The configuration of child decorators has lower priority than configuration directly in the parent class decorator. That is to say:

```ts {8,10}
const request1 = axiosPlus.create({
  baseURL: 'http://localhost:3000/users/',
});
const request2 = axiosPlus.create({
  baseURL: 'http://localhost:3000/orders/',
});
@HttpApi({
  refAxios: request1,
})
@RefAxios(request2)
class UserApi {
  @Get({
    url: '/pages',
  })
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
// The final request URL is http://localhost:3000/users/pages?size=3&page=1
const { data } = await new UserApi().getUserPages(1, 3);
console.log(data);
```

The final request URL is `http://localhost:3000/users/pages?size=3&page=1`, not `http://localhost:3000/orders/pages?size=3&page=1`.
:::

::: warning Note
Also note that `@RefAxios` relies on the `@HttpApi` decorator. This means `@HttpApi` is indispensable; otherwise, an error will occur.
:::

## @AxiosRef

This decorator is a method decorator used to set the `axios` instance referenced by this specific method. It accepts an `axios` instance object as a configuration item, as shown below:

```ts {8}
const request = axiosPlus.create({
  baseURL: 'http://localhost:3000/users/',
});
class UserApi {
  @Get({
    url: '/pages',
  })
  @AxiosRef(request)
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
// The final request URL is http://localhost:3000/users/pages?size=3&page=1
const { data } = await new UserApi().getUserPages(1, 3);
console.log(data);
```

As you can see, using `@AxiosRef` even eliminates the need for `@HttpApi` because `@AxiosRef` directly binds an `axios` instance to `getUserPages`.

Furthermore, `@AxiosRef` can also be configured in the parent class decorator. The configuration priority of the child decorator is still lower than that of the parent class decorator's configuration, as shown below:

```ts {11,13}
const request1 = axiosPlus.create({
  baseURL: 'http://localhost:3000/users/',
});
const request2 = axiosPlus.create({
  baseURL: 'http://localhost:3000/orders/',
});

class UserApi {
  @Get({
    url: '/pages',
    refAxios: request1,
  })
  @AxiosRef(request2)
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
// The final request URL is http://localhost:3000/orders/pages?size=3&page=1
const { data } = await new UserApi().getUserPages(1, 3);
console.log(data);
```

::: tip Summary of Configuration Priority
Configuration in `@Get` > `@AxiosRef` decorator configuration > `@HttpApi` decorator configuration > `@RefAxios` decorator configuration
:::

## @TransformResponse

This decorator is a method decorator used to set the response data transformer. It is consistent with `transformResponse` in `axios`. It accepts a processing function or an array of functions. The return value of each function becomes the input for the next function. The return value of the last function will be the final response data, as shown below:

```ts {8-21}
const request = axiosPlus.create({
  baseURL: 'http://localhost:3000/users/',
});
class UserApi {
  @Get({
    url: '/pages',
  })
  @TransformResponse([
    // 1. Directly get the data field
    data => {
      return JSON.parse(data).data;
    },
    // 2. Add an age property
    data => {
      data = data.map((user: any) => {
        user['age'] = 12;
        return user;
      });
      return data;
    },
  ])
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
```

::: tip Execution Order and Merge Strategy

1.  Each function in `@TransformResponse` is executed from top to bottom.
2.  If `transformResponse` is configured in `@Get`, it will be merged with `@TransformResponse`. The functions in `@Get` will execute _before_ the functions in `@TransformResponse`.

:::

## @TransformRequest

This decorator is a method decorator used to set the request data transformer. It is consistent with `transformRequest` in `axios`. It accepts a processing function or an array of functions. The return value of each function becomes the input for the next function. The final return value is used as the request data, as shown below:

```ts
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Post({
    url: '/',
  })
  @TransformRequest([
    // Add property 'sex' to user
    data => {
      data.sex = '男';
      return data;
    },
    data => {
      data.email = '1111@11.com';
      return JSON.stringify(data);
    },
  ])
  createUser(@BodyParam() user: { name: string; age: number }): any {}
}
const { data } = await new UserApi().createUser({ name: 'test', age: 18 });
console.log(data);
```

::: tip Execution Order and Merge Strategy

1.  Each function in `@TransformRequest` is executed from top to bottom.
2.  If `transformRequest` is configured in `@Post`, it will be merged with `@TransformRequest`. The functions in `@Post` will execute _before_ the functions in `@TransformRequest`.

:::

## More Child Decorators

Currently, only these four decorators are provided. More child decorators will be added in the future. We welcome your valuable suggestions.
