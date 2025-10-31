# 搭建 mock 接口

## 基本介绍

为了方便前端开发人员快速搭建页面而不用等待后端真实接口。`axios-plus` 封装了一套 `mock` 接口的解决方案。你只需要做简单的配置就能将一个真实的接口变为`mock`接口，并在开发和生产环境下可以相互转换。

> 这里我们致敬 [msw](https://mswjs.io/)，它真实做到了从网络层面进行拦截

## 基本使用

想要将真实接口改为 `mock` 接口，只需要填写 `mock` 配置即可，`mock`配置项接受一个函数，如下所示：

```ts {1-2,7-14,20}
// 全局打开 mock 功能
MockAPI.on();
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    // mock 配置,后接处理器函数
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
let userApi = new UserApi();
// 注意：函数柯里化调用方式，而不是直接调用getUsers()
let { data } = await userApi.getUsers()();
console.log(data);
```

调用接口返回的`data`结果为：

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

在这里我们需要注意几个点：

1. 在使用`mock`接口前你需要先打开全局`mock`功能，`MockAPI.on()`
2. `mock`接口的调用方式是函数柯里化调用`getUsers()()`，而不是直接调用
3. 处理器函数接受一个`ctx`对象,这个`ctx`对象就是处理器参数，其包含了请求参数和响应对象，你可以通过它来获取传入的参数和设置响应数据。

## 处理器函数

### 多个处理器函数

也许有许多人会认为函数柯里化调用很奇怪，事实上`axios-plus`采用函数柯里化是有很多好处的，它能让你分步传参

1. 第一个参数传入的是必要的请求参数
2. 第二个参数传入的是处理器类型

这就意味着在第二次调用时能提供多种`mock`处理方式。比如下面的案例，我们一个`mock`接口可以提供成功和失败两种状态的处理方式：

```ts {9,17,26}
@HttpApi({
  baseURL: 'http://localhost:3000',
  url: '/users',
})
class UserApi {
  @Get({
    mock: {
      handlers: {
        success: ctx => {
          return HttpResponse.json({
            data: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          });
        },
        error: ctx => {
          return HttpResponse.error();
        },
      },
    },
  })
  getUsers(): any {}
}
let userApi = new UserApi();
let { data } = await userApi.getUsers()('success');
console.log(data);
```

当然这样写实在太丑陋了，嵌套非常深，`axios-plus`还提供了另一种写法就是直接在`mockHandlers`中单独配置处理器函数，这些处理器函数会最终与`mock.handlers`合并，如下所示：

```ts {5}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Post({
    url: '/pages/:page/:size',
    mockHandlers: {
      success: async ({ request }) => {
        const data = await request.json();
        const { page, size } = data as { page: number; size: number };
        // 1,10
        console.log(page, size);
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
      error: () => {
        return HttpResponse.error();
      },
      default: () => {
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@BodyParam() qo: { page: number; size: number }): any {}
}
let userApi = new UserApi();
let { data } = await userApi.getUserPages({ page: 1, size: 10 })('success');
console.log(data);
```

::: warning 同名处理器函数
如果你在`mock.handlers`和`mockHandlers`中配置了同名的处理器函数，那么`axios-plus`会优先使用`mock.handlers`中的处理器函数。
:::

### 默认处理器函数

刚才基本使用的案例中，我们只配置了一个处理器函数，这个处理器函数本质上就是一个名为`defulat`默认处理函数，也就是说你其实可以这么定义它:

```ts {8-14}
MockAPI.on();
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    // mock 配置,后接处理器函数
    mock: {
      handlers: {
        default: ctx => {
          return HttpResponse.json({
            data: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          });
        },
      },
    },
  })
  getUsers(): any {}
}
```

并通过如下方式进行调用：

```ts {3}
let userApi = new UserApi();
// 等价于getUsers()();
let { data } = await userApi.getUsers()('defualt');
console.log(data);
```

`axios-plus`中提供了默认的处理器函数，你的单个处理器函数只是覆盖了这个默认的处理器函数，如果你不配置处理器函数，那么它会调用默认的处理器函数。

```ts
@HttpApi({
  baseURL: 'http://localhost:3000',
  url: '/users',
})
class UserApi {
  @Get({
    mock: {},
  })
  getUsers(): any {}
}
let userApi = new UserApi();
let { data } = await userApi.getUsers()();
console.log(data);
```

结果为：

```json
{ "message": "welcome to use AxiosPlusMock" }
```

### 处理器函数原理

你可能会很好奇，为什么配置一个或一组函数就能让`mock`接口生效？其实`axios-plus`底层采用了`msw`的`Response resolver`，这个`Response resolver`就是处理器函数保证函数。它需要你自己定义请求地址和处理器函数。比如：

```ts
// 定义Response resolver
http.get('http://localhost:3000/users/groups', ({ request }) => {
  console.log(request.url);
  return HttpResponse.json({
    data: 'a',
  });
}),
const server = setupServer(...handlers);
server.listen();
```

可以看到原生的定义方式中，需要使用`msw`的`http.get`来定义一个`Response resolver`，你需要传入请求地址和处理器函数。

> `axios-plus`只是做了简化了工作，你不再需要设置`mock`接口的路径，`axios-plus`会自动读取`@HttpApi`和`@Get`这类装饰器的配置，以及`mock`配置，并自动生成`msw`的`Response resolver`，然后注册。

## HttpResponse

`HttpResponse`是`msw`提供的方便我们响应数据的`API`，具体你可以参见`msw`

### 构造函数

`HttpResponse`类具有与`Fetch API Response`类完全相同的构造函数签名。这包括静态响应方法，如`Response.json()`和`Response.error()`。

```ts
class HttpResponse {
  constructor(
    body:
      | Blob
      | ArrayBuffer
      | TypedArray
      | DataView
      | FormData
      | ReadableStream
      | URLSearchParams
      | string
      | null
      | undefined,
    options?: {
      status?: number;
      statusText?: string;
      headers?: HeadersInit;
    },
  );
}
```

通过调用这个构造函数，你可以创建一个`HttpResponse`实例，并设置响应数据和响应头。

```ts
// 这与 "new Response()" 同义。
new HttpResponse('Not found', {
  status: 404,
  headers: {
    'Content-Type': 'text/plain',
  },
});
```

### 常用静态方法

下面我会介绍一些常用的`HttpResponse`静态方法。

#### json

`json`方法可以将响应数据转换为`json`格式，并设置响应头`Content-Type: application/json`

```ts
return HttpResponse.json(
  {
    errorMessage: 'Missing session',
  },
  { status: 401 },
);
```

#### error

`error`方法可以模拟一个`network error`

```ts
return HttpResponse.error();
```

### 自定义方法

`HttpResponse`类还附带了一组自定义的静态方法，以简化响应声明。这些方法在`Fetch API`规范中没有替代品，完全是库特定的。

#### text

`HttpResponse.text(body, init)`
创建一个带有`Content-Type: text/plain`头和给定响应体的`Response`实例。

```ts
HttpResponse.text('Hello world!');
```

#### html

`HttpResponse.html(body, init)`
创建一个带有`Content-Type: text/html`头和给定响应体的`Response`实例。

```ts
HttpResponse.html(`<p class="greeting">Hello world!</p>`);
```

::: tip 使用原生`Response`
您绝对可以在您的响应解析器中使用原生的 `Fetch API Response` 实例。`MSW` 是建立在标准的请求和响应基础之上的，因此您可以随时使用它们。只需要在处理器函数参数中获取`Response`对象即可。处理器函数参数即将介绍。
:::

## 处理器函数参数

处理器函数能够接受一个参数，这个参数本质上就是一个上下文对象，包含了请求参数和响应对象，你可以通过它来获取传入的参数和设置响应数据。它有如下属性：

| Property  | Type                               | Description                                                  |
| :-------- | :--------------------------------- | :----------------------------------------------------------- |
| request   | Request                            | Fetch API Request representation of the intercepted request. |
| requestId | string                             | UUID representing the intercepted request.                   |
| params    | Record<string, string \| string[]> | Request path parameters (e.g. :userId).                      |
| cookies   | Record<string, string>             | Parsed request cookies.                                      |

通过它我们能够获取请求参数，并设置响应数据。下面列举了一些常用接受参数响应数据的场景:

### 接受查询参数

`request`是一个查询参数对象，你可以通过它获取查询参数。

```js {6-8,19,22}
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    url: '/pages',
    mock: ({ request }) => {
      const url = new URL(request.url);
      const page = url.searchParams.get('page');
      const size = url.searchParams.get('size');
      // 1,10
      console.log(page, size);
      return HttpResponse.json({
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      });
    },
  })
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
let userApi = new UserApi();
let { data } = await userApi.getUserPages(1, 10)();
console.log(data);
```

### 接受路径参数

通过`params`属性，你可以获取路径参数。

```js {6-8}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: ({ params }) => {
      const { page, size } = params;
      // 1,10
      console.log(page, size);
      return HttpResponse.json({
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      });
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
```

### 接受请求体参数

通过`request`属性，你可以获取请求体参数。

```js {7-10,19,22}
test.only('接受请求体参数', async () => {
  @HttpApi('http://localhost:3000/users/')
  class UserApi {
    @Post({
      url: '/pages/:page/:size',
      mock: async ({ request }) => {
        const data = await request.json();
        const { page, size } = data as { page: number; size: number };
        // 1,10
        console.log(page, size);
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    })
    getUserPages(@BodyParam() qo: { page: number; size: number }): any {}
  }
  let userApi = new UserApi();
  let { data } = await userApi.getUserPages({ page: 1, size: 10 })();
  console.log(data);
```

::: warning 注意
你需要改为`post`请求方式才能传递请求体参数。
:::
