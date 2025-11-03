# Parameter Decorators

[[toc]]

## @QueryParams

### Basic Usage

The `@QueryParams` decorator is used to convert parameter objects into query strings. As shown below:

```ts {5-6,9}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get('/pages')
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
const userApi = new UserApi();
// The final request URL is http://localhost:3000/users/pages?page=1&size=20
const { data } = await userApi.getUserPages(1, 20);
console.log(data);
```

::: warning Decorator Duplication and Conflicts
The `@QueryParams` decorator cannot be used simultaneously with `@QueryParams`, `@BodyParams`, or `@PathParams` decorators. The following scenarios are not allowed:

```ts
getUserPages(@QueryParam('page1')@QueryParam('page') page: number): any {}
// Or
getUserPages(@PathParam('id') @QueryParam('size') size: number): any {}
```

In fact, most decorators in `axios-plus` cannot appear repeatedly, otherwise an error will be thrown.

:::

### Multiple Parameter Merging

The `@QueryParams` decorator can merge multiple parameters with the same name into an array, which is particularly useful for passing array parameters. As shown below:

```ts {5-6,9}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get('/groups')
  getUserGroups(@QueryParam('ids') id1: number, @QueryParam('ids') id2: number): any {}
}
// The final request URL is http://localhost:3000/users/groups?ids[]=2&ids[]=1
const { data } = await userApi.getUserGroups(1, 2);
console.log(data);
```

## @PathParam

The `@PathParam` decorator is used to convert parameter objects into path parameters. As shown below:

```ts {5-6,9}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get('/:id')
  getUserById(@PathParam('id') id: number): any {}
}
// The final request URL is http://localhost:3000/users/1
const { data: data3 } = await userApi.getUserById(1);
console.log(data);
```

In the example above, the `@PathParam` decorator converts the `id` parameter object into the path parameter `1`.

## @BodyParam

### Basic Usage

The `@BodyParam` decorator is used to collect parameters as request body parameters. As shown below:

```ts {5-6,9}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Post('/')
  createUser(@BodyParam('user') user: { name: string; age: number }): any {}
}
// The final request URL is http://localhost:3000/users/1
const { data } = await userApi.createUser({ name: 'test', age: 18 });
console.log(data);
```

::: tip Single Parameter Name Omission
When the `@BodyParam` decorator receives only one parameter, the `data` object is flattened by one level, as shown below:

```json
data:{
  "name": "test",
  "age": 18
}
// Instead of
data: {
  "user": {
    "name": "test",
    "age": 18
  }
}
```

Therefore, when there's only one parameter, `axios-plus` allows you to omit the parameter name:

```ts
@Post('/')
createUser(@BodyParam() user: { name: string; age: number }): any {}
```

:::

### Multiple Parameter Merging

When there are multiple parameters, the `@BodyParam` decorator can merge multiple parameter objects with the same name into a single object. As shown below:

```ts {7-8}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Post('/')
  createUser(
    @BodyParam('user') user: { name: string; age: number },
    @BodyParam('person') person: { sex: string },
  ): any {}
}
// Body parameters
const { data } = await userApi.createUser({ name: 'test', age: 18 }, { sex: '男' });
console.log(data);
```

The final `body` parameters will be as follows:

```json
{ "person": { "sex": "男" }, "user": { "name": "test", "age": 18 } }
```

::: warning All Parameters Omitted
If you omit both parameter names, they will be merged into an array:

```ts {3-4}
@Post('/')
createUser(
  @BodyParam() user: { name: string; age: number },
  @BodyParam() person: { sex: string },
```

The final result will be:

```json
[{ "sex": "男" }, { "name": "test", "age": 18 }]
```

:::

### File Upload

You can also use `@BodyParam` to implement more complex functionality, such as file uploads:

```ts {5-10}
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

::: tip Headers Parameter
Since the data in the `Body` can be diverse, to inform the backend how to parse your `Body` data, you need to explicitly set the `mime` type. That is, you need to specify `Content-Type` as `multipart/form-data` in the `headers`. Common `mime` types are shown in the table below:

| MIME Type                             | Purpose                               | Example Scenario                     |
| ------------------------------------- | ------------------------------------- | ------------------------------------ |
| **text/html**                         | Web page rendering (<html>...</html>) | HTML web pages                       |
| **application/json**                  | JSON data                             | API responses ({"name":"John"})      |
| **application/javascript**            | JavaScript code                       | Frontend scripts (app.js)            |
| **image/jpeg**                        | JPEG images                           | Photos (.jpg)                        |
| **image/png**                         | PNG images                            | Transparent background images (.png) |
| **application/pdf**                   | PDF documents                         | E-books/contracts (.pdf)             |
| **application/x-www-form-urlencoded** | Form submission (key-value pairs)     | name=John&age=30                     |
| **multipart/form-data**               | File upload forms                     | <input type="file">                  |
| **application/octet-stream**          | Arbitrary binary files                | Download files (.exe, .zip)          |

:::
