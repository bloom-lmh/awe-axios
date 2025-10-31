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

## mock 次数配置

## mock 开关

## 环境感知

## 获取原生接口
