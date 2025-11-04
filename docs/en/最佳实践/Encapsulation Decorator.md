# Encapsulating Decorators

## Basic Introduction

As mentioned earlier, child decorators can make our configurations clearer, but they still don't solve the issue of lengthy configurations. For example:

```ts {3-18}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Post({
    url: '/',
    transformRequest: [
      data => {
        data.email = '1111@11.com';
        return data;
      },
    ],
  })
  @TransformRequest([
    // Add sex property to user
    data => {
      data.sex = '男';
      return JSON.stringify(data);
    },
  ])
  createUser(@BodyParam() user: { name: string; age: number }): any {}
}
const { data } = await new UserApi().createUser({ name: 'test', age: 18 });
console.log(data);
```

Doesn't this look quite messy? To solve this problem, `awe-axios` allows encapsulating custom decorators. For example:

```ts {1-17,20-22}
/**
 * Custom decorator
 * @param config Configuration
 */
function CustomPost(config: HttpMethodDecoratorConfig<any>) {
  config.transformRequest = [
    data => {
      data.email = '1111@11.com';
      return data;
    },
    data => {
      data.sex = '男';
      return JSON.stringify(data);
    },
  ];
  return Post(config);
}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @CustomPost({
    url: '/',
  })
  createUser(@BodyParam() user: { name: string; age: number }): any {}
}
const { data } = await new UserApi().createUser({ name: 'test', age: 18 });
console.log(data);
```

Now it looks much better, doesn't it?

## Best Practices

You can even encapsulate a set of decorators for your project and import them when needed. This allows for composable reuse, making your code more concise.

::: code-group

```ts [Encapsulate file upload POST] {2-5}
function FileUp(config: HttpMethodDecoratorConfig) {
  config.headers = {
    'Content-Type': 'multipart/form-data',
  };
  return Post(config);
}
```

```ts [Encapsulate Data Parser] {3}
// Extract only the data part from the response
function ExtractData() {
  return TransformResponse(() => (data: any) => data.data);
}
```

```ts [Usage] {3-4}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @FileUp({ url: '/upload' })
  @ExtractData()
  avaterUpload(@BodyParam() form: FormData): any {}
}
const form = new FormData();
form.append('file', new File(['test'], 'test.txt'));
const { data } = await new UserApi().avaterUpload(form);
console.log(data);
```

:::

## Configuration Options

Of course, custom decorators need to be built upon existing decorators, so you need to understand the configuration options of existing decorators. Below are some commonly used configuration options:

1. `HttpMethodDecoratorConfig`: Common configuration for all HTTP method decorators, such as `@Get`, `@Post`, `@Put`, `@Delete`, etc., all inherit from this configuration.
2. `MockConfig`: Configuration for the `@Mock` decorator, which will be introduced in the next chapter.
3. ...

You can actually use your IDE tools to click and view these configuration options in detail.
