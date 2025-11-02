# 取消 mock

## 接口二像性

前面已经介绍到过在`axios-plus`的世界里，接口既是真实接口，又是`mock`接口，就像波粒二象性那样，接口也呈现二像性。
并且在之前的章节中，我们学会了如何通过配置将真实接口变为`mock`接口，现在将会讲解如何将`mock`接口变为真实接口。`axios-plus`提供了类方法来取消`mock`接口，如下所示：

::: tip 关于取消`mock`接口
这里说的取消`mock`接口是从逻辑上进行取消，也就是说同样的调用方式不会走`mock`接口，而是走真实接口。这样设计的目的在于，使得代码满足开闭原则，即可以通过配置来切换接口的使用方式，而不需要修改代码。
:::

## 信号量机制

`axios-plus`借鉴了`axios`的信号量机制，在`axios-plus`中，我们也可以通过配置信号量来逻辑取消`mock`，如下所示：

```ts {1-2,24,26-28}
// 创建mock控制器
const mockCtr = new SignalController();
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      signal: mockCtr.signal,
      handlers: async ({ request, params }) => {
        const { page, size } = params;
        // 1,10
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 发送到mock接口 ：http://localhost:3000/users/176189724290824/default/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
// 取消mock（走真实的接口）
mockCtr.abort();
// 发送到服务器真实接口 ： http://localhost:3000/users/pages/1/20
let { data: data2 } = await userApi.getUserPages(1, 20)();
```

上面的案例中，我们通过`mockCtr.signal`配置了信号量，当`mockCtr.abort()`被调用时，`axios-plus`会取消`mock`接口的调用，从而走真实接口。
:star:所以当后端接口开发完毕时你没有必要将其改为`userApi.getUserPages(1, 20)`方式

## 设置 mock 接口使用次数

除了使用信号量来取消`mock`接口，`axios-plus`还提供了`mock`次数配置，也就是说在`mock`接口被调用的次数达到指定次数后就会自动取消，而后全部走真实接口，这有什么好处呢？我们可以在页面初次加载的时候调用`mock`接口，先展示部分假数据，等到数据加载完成后再调用真实接口，这样可以提升用户体验。

如下所示：

```ts {6,31}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      count: 3,
      handlers: async ({ request, params }) => {
        console.log('mock接口');
        console.log(request.url);
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
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 发送到mock接口 ：http://localhost:3000/users/176189724290824/default/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
// 发送到mock接口 ：http://localhost:3000/users/176189724290824/default/pages/1/20
let { data: data2 } = await userApi.getUserPages(1, 20)();
// 发送到mock接口 ：http://localhost:3000/users/176189724290824/default/pages/1/30
let { data: data3 } = await userApi.getUserPages(1, 30)();
// mock接口次数达到上限，走真实的接口
// 发送到服务器真实接口 ： http://localhost:3000/users/pages/1/40
let { data: data4 } = await userApi.getUserPages(1, 40)();
// 发送到服务器真实接口 ： http://localhost:3000/users/pages/1/50
let { data: data5 } = await userApi.getUserPages(1, 50)();
// 发送到服务器真实接口 ： http://localhost:3000/users/pages/1/60
let { data: data6 } = await userApi.getUserPages(1, 60)();
```

## mock 开关

试想一下有这种场景：前后端联调时，我们需要在后端接口开发完毕前，前端先使用`mock`接口的假数据，而后端接口开发完毕后，我们再将`mock`接口关闭，这样就可以看到真实接口的数据。这时候我们就可以通过配置`mock`开关来实现这个功能，`axios-plus`支持三种级别的`mock`开关配置，分别是接口级别、类级别、全局级别，优先级从高到低，如下所示：

### 接口级别开启/关闭

我们可以通过`mock`配置项中的`on`属性来控制接口是否使用`mock`接口，这样可以一个后端接口开发完毕后关闭一个`mock`接口，实现方法级别的控制，这个优先级最高，如下所示：

```ts {6,22}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      on: false,
      handlers: async ({ request, params }) => {
        // 1,10
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 由于关闭了mock，所以走真实的接口 ： http://localhost:3000/users/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

::: tip 默认值
当你配置`mock`接口时，即便没有配置`on`属性其默认也为`true`，也就是说如果你要关闭`mock`接口，你需要显式的配置`on: false`。
:::

### 类级别开启/关闭

除了接口级别的开关，`axios-plus`还提供了类级别的开关，也就是说你可以在整个类中控制是否使用`mock`接口，这样你就能按模块（类）来统一控制多个`mock`接口的开关，这个的优先级小于接口级别的开关但高于全局级别的开关。如下所示：

```ts {3-5,26}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
  mock: {
    on: false,
  },
})
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      handlers: async ({ request, params }) => {
        // 1,10
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 由于关闭了mock，所以走真实的接口 ： http://localhost:3000/users/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

### 全局开启/关闭

在前面的介绍中已经提到过全局打开`mock`接口。即`MockAPI.on()`，但是这个优先级最低。如下所示：

```ts {2,23}
test.only('mock开关', async () => {
  MockAPI.off();
  @HttpApi('http://localhost:3000/users/')
  class UserApi {
    @Get({
      url: '/pages/:page/:size',
      mock: {
        handlers: async ({ request, params }) => {
          // 1,10
          const { page, size } = params;
          return HttpResponse.json({
            data: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          });
        },
      },
    })
    getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
  }
  let userApi = new UserApi();
  // 由于关闭了mock，所以走真实的接口 ： http://localhost:3000/users/pages/1/10
  let { data: data1 } = await userApi.getUserPages(1, 10)();
```

## 环境设置

`mock`开关虽然能够显示的控制`mock`接口的开放和关闭，但是在实际开发中，我们可能需要工具能够智能的根据不同的环境来控制`mock`接口的使用，比如开发环境使用`mock`接口，测试/生产环境使用真实接口。`axios-plus`提供了环境设置的功能，我们通过设置环境控制`mock`接口和真实接口的切换，也就是说即便你打开了`mock`接口，但是环境不满足`mock`环境也不会走`mock`接口而是真实接口。`axios-plus`提供了三种级别的环境设置方式，分别是接口级别、类级别、全局级别，优先级从高到低，如下所示：

### 接口级别环境感知

通过`condition`配置项即可实现接口级别的环境感知，如下所示：

```ts {6-9,25}
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      condition: () => {
        // 测试环境下走mock接口
        return process.env.NODE_ENV === 'test';
      },
      handlers: async ({ request, params }) => {
        // 1,10
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 由于是测试环境，所以走mock接口 ： http://localhost:3000/users/176189724290824/default/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

### 类级别环境感知

类级别的环境设置优先级比接口级别低，但是比全局级别高，如下所示：

```ts{4-7,29}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
  mock: {
    condition: () => {
      // 测试环境下走mock接口
      return process.env.NODE_ENV === 'test';
    },
  },
})
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      handlers: async ({ request, params }) => {
        // 1,10
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 由于关闭了mock，所以走真实的接口 ： http://localhost:3000/users/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

### 全局环境感知

全局环境设置优先级最低，如下所示：

```ts {1-3,26}
MockAPI.setCondition(() => {
  return process.env.NODE_ENV === 'test';
});
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get({
    url: '/pages/:page/:size',
    mock: {
      handlers: async ({ request, params }) => {
        // 1,10
        const { page, size } = params;
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        });
      },
    },
  })
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
}
let userApi = new UserApi();
// 由于关闭了mock，所以走真实的接口 ： http://localhost:3000/users/pages/1/10
let { data: data1 } = await userApi.getUserPages(1, 10)();
```

::: tip 默认值
实际上你没有必要全局再设置`process.env.NODE_ENV === 'test'`，因为`axios-plus`默认设置全局`process.env.NODE_ENV === 'test'`
:::
