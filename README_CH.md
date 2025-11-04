# Awe-Axios

注意以下只是简介，具体参考官方文档。
[Official website](https://awe-axios.vercel.app/)
[中文官网](https://aweaxios-758490sk.maozi.io/zh/%E8%B5%B7%E6%AD%A5/%E5%9F%BA%E6%9C%AC%E4%BB%8B%E7%BB%8D.html)

## 基本介绍

Awe-Axios 是基于 axios 扩展的增强型 HTTP 请求工具库，通过装饰器模式、配置扩展等方式优化请求体验，同时保持与 axios 生态的完全兼容。支持注解驱动、请求重传、防抖节流、Mock 拦截、面向切面、依赖注入等核心功能，适用于各类前端 HTTP 请求场景。

## 核心特性

- 注解驱动：通过装饰器定义 API 接口，被装饰方法自动代理为请求接口，简化配置
- 功能封装：内置请求重传、防抖、节流等常用功能，无需重复开发
- 无侵入设计：不修改 axios 原有 API，兼容现有 axios 项目
- 真实 Mock 拦截：基于 msw 实现网络层面请求拦截，支持接口二义性（同一接口既是真实接口也是 Mock 接口）
- 面向切面（AOP）：支持请求前后、成功失败等阶段的精细化拦截
- 依赖注入（DI）：提供 IoC 容器，支持类实例注册与注入，解耦组件依赖
- 多环境适配：支持自定义 axios 实例，适配不同域名、认证方式的后端服务

## 适用场景

1. 企业级应用开发：通过装饰器集中管理 API，提升代码可维护性
2. 高频请求场景：防抖、节流功能减少无效网络请求，优化性能
3. 不稳定网络环境：请求重传机制提升接口成功率
4. 前后端并行开发：内置 Mock 功能，无需等待后端接口就绪
5. 多环境切换：支持自定义 axios 实例，适配开发、测试、生产等多环境
6. 数据转换需求：提供请求/响应数据转换器，处理格式转换、加密解密等场景

## 快速开始

### 安装

```bash
# npm
npm install awe-axios --save

# yarn
yarn add awe-axios
```

### 环境要求

需使用 TypeScript 开发，在 tsconfig.json 中添加以下配置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 基本使用

```typescript
import { HttpApi, Get, Post, PathParam, BodyParam, QueryParam } from 'awe-axios';

@HttpApi({
  baseURL: 'http://localhost:3000/users',
})
class UserApi {
  // GET /users
  @Get('/')
  getAllUsers(): any {}

  // GET /users/:id （失败时重试3次）
  @Get({
    url: '/:id',
    retry: 3,
  })
  getUserById(@PathParam('id') id: number): any {}

  // POST /users （提交请求体）
  @Post('/')
  addUser(@BodyParam() data: { name: string; age: number }): any {}

  // GET /users/page?page=xxx&size=xxx （Mock 接口）
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

// 使用示例
const userApi = new UserApi();
const allUsers = await userApi.getAllUsers();
const user = await userApi.getUserById(1);
const newUser = await userApi.addUser({ name: 'test', age: 18 });
```

### 原生 axios 使用

AxiosPlus 兼容原生 axios API，可直接使用 axiosPlus 调用：

```typescript
import { axiosPlus } from 'awe-axios';

// 请求拦截器
axiosPlus.interceptors.request.use(config => {
  console.log('请求拦截器', config);
  return config;
});

// 直接发起请求
axiosPlus.get('http://localhost:3000/users');
```

## HTTP 请求方法

AxiosPlus 提供类装饰器和方法装饰器，用于快速定义 API 接口。

### 类装饰器 @HttpApi

用于标记 HTTP 接口类，定义公共配置：

```typescript
import { HttpApi, Get } from 'awe-axios';

// 基础用法
@HttpApi('https://api.example.com')
class UserApi {
  @Get('/users')
  getUserList(): any {} // 实际请求地址：https://api.example.com/users
}

// 完整配置
@HttpApi({
  baseURL: 'https://api.example.com', // 基础路径
  url: '/v1', // 路径前缀
  refAxios: customAxiosInstance, // 自定义 axios 实例
  mock: {
    // 全局 Mock 配置
    on: true, // 是否开启 Mock
    condition: () => process.env.NODE_ENV === 'development', // 触发条件
  },
})
class UserApiV1 {
  @Get('/users')
  getUserList(): any {} // 实际请求地址：https://api.example.com/v1/users
}
```

#### 配置合并规则

- baseURL：方法装饰器配置覆盖类装饰器
- url：类装饰器 url 与方法装饰器 url 自动拼接（处理斜杠）
- headers：深度合并，方法装饰器配置优先
- refAxios：方法装饰器配置覆盖类装饰器

### 方法装饰器

涵盖所有 HTTP 标准方法，配置项继承自 axios 并扩展增强功能：

| 装饰器   | 说明              | 适用场景                 |
| -------- | ----------------- | ------------------------ |
| @Get     | 定义 GET 请求     | 查询资源                 |
| @Post    | 定义 POST 请求    | 创建资源（注意幂等性）   |
| @Put     | 定义 PUT 请求     | 全量更新资源             |
| @Delete  | 定义 DELETE 请求  | 删除资源                 |
| @Patch   | 定义 PATCH 请求   | 部分更新资源             |
| @Options | 定义 OPTIONS 请求 | 跨域预检、查询支持的方法 |
| @Head    | 定义 HEAD 请求    | 获取响应头（无响应体）   |

#### 示例：@Post 用法

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  @Post('/users')
  createUser(@BodyParam() user: { name: string; age: number }) {}
}
```

#### 增强功能配置

方法装饰器支持重试、防抖、节流等增强配置：

```typescript
@Get({
  url: '/data',
  retry: 3, // 重试3次
  debounce: 300, // 防抖300ms
  throttle: 1000, // 节流1s
  mock: {} // Mock 配置
})
getData(): any {}
```

## 参数装饰器

用于处理请求参数，支持查询参数、路径参数、请求体参数：

### @QueryParam

将参数转换为查询字符串（?key=value）：

```typescript
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get('/pages')
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}

// 调用：userApi.getUserPages(1, 20)
// 最终地址：http://localhost:3000/users/pages?page=1&size=20
```

#### 多参数合并

同名参数自动合并为数组：

```typescript
@Get('/groups')
getUserGroups(
  @QueryParam('ids') id1: number,
  @QueryParam('ids') id2: number
): any {}

// 调用：userApi.getUserGroups(1, 2)
// 最终地址：http://localhost:3000/users/groups?ids[]=1&ids[]=2
```

### @PathParam

将参数替换为路径占位符（/path/:id）：

```typescript
@Get('/:id')
getUserById(@PathParam('id') id: number): any {}

// 调用：userApi.getUserById(1)
// 最终地址：http://localhost:3000/users/1
```

### @BodyParam

收集参数作为请求体（支持 JSON、form-data 等格式）：

```typescript
// 基础用法
@Post('/')
createUser(@BodyParam() user: { name: string; age: number }): any {}

// 多参数合并
@Post('/')
createUser(
  @BodyParam('user') user: { name: string; age: number },
  @BodyParam('person') person: { sex: string }
): any {}
// 最终请求体：{ "user": { "name": "test" }, "person": { "sex": "男" } }

// 文件上传（需指定 Content-Type）
@Post({
  url: '/upload',
  headers: { 'Content-Type': 'multipart/form-data' }
})
uploadFile(@BodyParam('file') file: FormData): any {}
```

## 常用功能详解

### 请求重发（Retry）

请求失败时自动重试，提高成功率，适用于非实时性接口。

#### 基本使用

```typescript
import { useRetry } from 'awe-axios';

// 定义接口
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get('/:id')
  getUserById(@PathParam('id') id: number): any {}
}

const userApi = new UserApi();
// 包装为带重试功能的接口
const retryGetUser = useRetry(userApi.getUserById);
// 调用（默认重试3次，基础延迟100ms）
await retryGetUser(1);
```

#### 配置方式

```typescript
// 仅指定重试次数
const retryGetUser = useRetry(userApi.getUserById, 3);

// 完整配置
const retryGetUser = useRetry(userApi.getUserById, {
  count: 3, // 重试次数
  delay: 1000, // 基础延迟时间（ms）
});

// 数组形式 [次数, 延迟]
const retryGetUser = useRetry(userApi.getUserById, [3, 1000]);
```

#### 特性

- 指数退避策略：第 n 次重试延迟 = delay \* 2^(n-1)
- 首次重试无延迟，从第二次开始应用延迟
- 不推荐 Post 请求使用（可能导致数据重复提交）

### 防抖（Debounce）

限制短时间内多次触发的请求，仅执行最后一次，适用于搜索框、频繁点击等场景。

#### 基本使用

```typescript
import { useDebounce } from 'awe-axios';

// 包装为带防抖功能的接口
const debounceGetUser = useDebounce(userApi.getUserById, 300);

// 短时间内多次调用，仅执行最后一次
debounceGetUser(1);
debounceGetUser(2);
debounceGetUser(3); // 仅此次生效
```

#### 配置方式

```typescript
// 仅指定延迟时间（ms）
const debounceGetUser = useDebounce(userApi.getUserById, 300);

// 完整配置
const debounceGetUser = useDebounce(userApi.getUserById, {
  delay: 300, // 延迟时间
  immediate: true, // 是否立即执行第一次请求
});
```

### 节流（Throttle）

限制请求执行频率，指定时间间隔内仅执行一次，适用于滚动加载、实时刷新等场景。

#### 基本使用

```typescript
import { useThrottle } from 'awe-axios';

// 包装为带节流功能的接口（1s 内最多执行一次）
const throttleGetUser = useThrottle(userApi.getUserById, 1000);

// 短时间内多次调用，仅1s内首次生效
throttleGetUser(1);
throttleGetUser(2); // 被忽略
await delay(1000);
throttleGetUser(3); // 生效
```

### 功能组合

支持多种功能组合使用（装饰器模式）：

```typescript
// 防抖 + 重试（搜索场景）
const debounceRetryGet = useDebounce(useRetry(userApi.getUserById), 300);

// 节流 + 重试（滚动加载场景）
const throttleRetryGet = useThrottle(useRetry(userApi.getUserById), 1000);
```

#### 注意事项

- 不推荐防抖与节流同时使用（策略冲突）
- 推荐组合：搜索场景（防抖+重试）、滚动加载（节流+重试）、普通接口（仅重试）

## 子项装饰器

用于拆分复杂配置，使代码结构更清晰，支持以下子项装饰器：

### @RefAxios（类装饰器）

设置类中所有接口的默认 axios 实例：

```typescript
const customAxios = axiosPlus.create({ baseURL: 'http://localhost:3000/users' });

@HttpApi()
@RefAxios(customAxios)
class UserApi {
  @Get('/pages')
  getUserPages(): any {} // 自动使用 customAxios 实例
}
```

### @AxiosRef（方法装饰器）

设置单个接口的 axios 实例（优先级高于类配置）：

```typescript
class UserApi {
  @Get('/pages')
  @AxiosRef(customAxios)
  getUserPages(): any {}
}
```

### @TransformResponse

设置响应数据处理器（与 axios transformResponse 一致）：

```typescript
@Get('/pages')
@TransformResponse([
  // 第一步：解析 JSON 并提取 data 字段
  data => JSON.parse(data).data,
  // 第二步：处理数据
  data => data.map(user => ({ ...user, age: 18 }))
])
getUserPages(): any {}
```

### @TransformRequest

设置请求数据处理器（与 axios transformRequest 一致）：

```typescript
@Post('/')
@TransformRequest([
  // 第一步：添加额外字段
  data => ({ ...data, sex: '男' }),
  // 第二步：转换为 JSON 字符串
  data => JSON.stringify(data)
])
createUser(@BodyParam() user: { name: string; age: number }): any {}
```

## Mock 接口搭建

基于 msw 实现网络层面请求拦截，支持接口二义性（同一接口既是真实接口也是 Mock 接口）。

### 基本使用

```typescript
import { MockAPI, HttpResponse } from 'awe-axios';

// 开启全局 Mock
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

// 调用 Mock 接口（柯里化调用）
const userApi = new UserApi();
const { data } = await userApi.getUsers()();
```

### 处理器函数

支持多状态处理器（成功/失败等）：

```typescript
@Get({
  mock: {
    handlers: {
      success: ctx => HttpResponse.json({ data: [1, 2, 3] }),
      error: ctx => HttpResponse.error()
    }
  }
})
getUsers(): any {}

// 调用指定处理器
await userApi.getUsers()('success'); // 成功状态
await userApi.getUsers()('error'); // 失败状态
```

#### 简化写法（mockHandlers）

```typescript
@Get({
  mockHandlers: {
    success: ctx => HttpResponse.json({ data: [1, 2, 3] }),
    error: ctx => HttpResponse.error()
  }
})
getUsers(): any {}
```

### 处理器参数

通过 ctx 参数获取请求信息：

```typescript
@Post('/pages/:page/:size')
@Mock({
  handlers: async ({ request, params, cookies }) => {
    // 获取查询参数
    const url = new URL(request.url);
    const page = url.searchParams.get('page');

    // 获取路径参数
    const { size } = params;

    // 获取请求体
    const body = await request.json();

    // 获取 Cookie
    const token = cookies.token;

    return HttpResponse.json({ page, size, body });
  }
})
getPages(): any {}
```

### HttpResponse 常用方法

| 方法    | 说明                                        | 示例                                             |
| ------- | ------------------------------------------- | ------------------------------------------------ |
| json()  | 返回 JSON 格式响应（自动设置 Content-Type） | HttpResponse.json({ data: [] }, { status: 200 }) |
| error() | 返回网络错误                                | HttpResponse.error()                             |
| text()  | 返回文本响应                                | HttpResponse.text('success')                     |
| html()  | 返回 HTML 响应                              | HttpResponse.html('<h1>Hello</h1>')              |

## 取消 Mock

支持多种方式切换真实接口与 Mock 接口，无需修改业务代码。

### 信号量机制

通过 SignalController 动态取消 Mock：

```typescript
// 创建 Mock 控制器
const mockCtr = new SignalController();

@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    mock: {
      signal: mockCtr.signal,
      handlers: () => HttpResponse.json({ data:
```
