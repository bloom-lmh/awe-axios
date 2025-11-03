# AxiosPlus 全功能介绍文档

[中文官网]()
[Official website]()

## 1. 什么是 AxiosPlus？

`AxiosPlus` 是在 `axios` 基础上扩展的增强型 HTTP 请求工具库，通过装饰器模式、配置扩展等方式提供更丰富的功能和更灵活的使用方式，同时保持与 axios 生态的兼容性。

核心特性包括：

- **注解驱动**：基于装饰器定义 API 接口，自动代理为请求方法
- **功能封装**：内置请求重传、防抖、节流等常用功能
- **无侵入设计**：兼容 axios 原有 API，可平滑迁移
- **强大 mock 能力**：基于 msw 实现网络层面拦截，支持真实/mock 接口无缝切换
- **接口二义性**：同一接口可同时作为真实接口和 mock 接口
- **面向切面编程**：精细化控制请求/响应拦截
- **依赖注入**：支持实例管理与依赖注入，便于多环境配置

## 2. 适用场景

`AxiosPlus` 适用于各类需要处理 HTTP 请求的前端应用，尤其适合：

1. **企业级应用开发**：通过装饰器集中管理 API 配置，提高可维护性
2. **高频请求场景**：利用防抖、节流优化请求性能
3. **不稳定网络环境**：通过请求重传机制提升成功率
4. **多环境适配**：支持自定义 axios 实例，适配不同后端服务
5. **前后端并行开发**：内置 mock 功能，无需等待后端接口
6. **数据转换需求**：提供便捷的请求/响应数据转换能力

支持 Vue、React 等框架应用及原生 JavaScript 项目。

## 3. 快速开始

### 3.1 安装

```bash
# 使用 npm
npm install axios-plus --save

# 使用 yarn
yarn add axios-plus
```

### 3.2 环境要求

需要 TypeScript 环境，并在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 3.3 基本使用

```typescript
@HttpApi({
  baseURL: 'http://localhost:3000/users',
})
class UserApi {
  // 基础 GET 请求
  @Get('/')
  getAllUsers(): any {}

  // 带路径参数的 GET 请求，失败时重试 3 次
  @Get({
    url: '/:id',
    retry: 3,
  })
  getUserById(@PathParam('id') id: number): any {}

  // POST 请求
  @Post('/')
  addUser(@BodyParam() data: { name: string; age: number }): any {}

  // 带 mock 功能的请求
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

## 4. 核心功能详解

### 4.1 HTTP 请求方法

`AxiosPlus` 提供了一系列 HTTP 方法装饰器，继承自 axios 配置并扩展了增强功能：

#### 4.1.1 @Get 装饰器

基础用法：

```typescript
@HttpApi('https://api.example.com')
class UserApi {
  // 仅指定路径
  @Get('/users')
  getUserList(): any {}

  // 带路径参数
  @Get('/users/:id')
  getUserDetail(): any {}
}
```

支持的配置项：
| 类别 | 配置项 | 说明 |
|------|--------|------|
| 基础配置 | `url` | 请求路径 |
| | `baseURL` | 覆盖类装饰器的 baseURL |
| | `headers` | 请求头信息 |
| | `timeout` | 超时时间（毫秒） |
| 增强功能 | `retry` | 重试配置 |
| | `debounce` | 防抖配置 |
| | `throttle` | 节流配置 |
| | `mock` | 方法级 mock 配置 |

#### 4.1.2 参数装饰器

配合请求方法使用的参数装饰器：

1. **@QueryParam**：用于查询参数（`?key=value`）
2. **@PathParam**：用于路径参数（`/path/:id`）
3. **@BodyParam**：用于请求体参数

**@BodyParam 示例**：

```typescript
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Post('/')
  createUser(@BodyParam() user: { name: string; age: number }): any {}
}
```

文件上传示例：

```typescript
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

### 4.2 常用功能

#### 4.2.1 请求重发

采用指数退避策略，支持失败自动重试：

```typescript
const userApi = new UserApi();

// 原始请求函数
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
}

// 装饰为带重试功能的请求（默认重试3次）
const retryGetUserById = useRetry(getUserById);
await retryGetUserById(1);
```

#### 4.2.2 防抖

限制短时间内重复请求，适用于搜索等场景：

```typescript
// 100ms 内多次调用只会执行一次
const debouncedGetUser = useDebounce(getUserById, 100);
```

适用场景：

- 搜索框输入联想
- 窗口大小调整触发的请求
- 频繁点击按钮的场景

#### 4.2.3 节流

控制请求执行频率，适用于滚动加载等场景：

```typescript
// 100ms 内最多执行一次
const throttledGetUser = useThrottle(getUserById, 100);
```

适用场景：

- 滚动加载更多数据
- 拖拽操作触发的请求
- 实时数据刷新（如仪表盘）

#### 4.2.4 功能组合

支持多种功能组合使用：

```typescript
// 节流+重试函数
const fn = useThrottle(useRetry(getUserById));
```

推荐组合：

- 搜索场景：`防抖 + 重传`
- 滚动加载：`节流 + 重传`
- 普通接口：`仅重传`（大多数场景）

### 4.3 Mock 功能

`AxiosPlus` 提供了便捷的 mock 接口解决方案，支持开发/生产环境无缝切换。

#### 4.3.1 基本使用

```typescript
// 全局开启 mock
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

// 调用 mock 接口（柯里化调用方式）
const userApi = new UserApi();
const { data } = await userApi.getUsers()();
```

#### 4.3.2 多处理器支持

```typescript
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    mock: {
      handlers: {
        success: ctx => {
          return HttpResponse.json({ data: [{ id: 1, name: 'Alice' }] });
        },
        error: ctx => {
          return HttpResponse.error();
        },
      },
    },
  })
  getUsers(): any {}
}

// 调用指定处理器
const { data } = await userApi.getUsers()('success');
```

#### 4.3.3 处理器函数参数

获取查询参数：

```typescript
@HttpApi('http://localhost:3000/users')
class UserApi {
  @Get({
    url: '/pages',
    mock: ({ request }) => {
      const url = new URL(request.url);
      const page = url.searchParams.get('page');
      const size = url.searchParams.get('size');
      return HttpResponse.json({
        data: [
          /* ... */
        ],
      });
    },
  })
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
```

获取请求体参数：

```typescript
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @Post({
    url: '/pages/:page/:size',
    mock: async ({ request }) => {
      const data = await request.json();
      const { page, size } = data;
      return HttpResponse.json({
        data: [
          /* ... */
        ],
      });
    },
  })
  getUserPages(@BodyParam() qo: { page: number; size: number }): any {}
}
```

#### 4.3.4 HttpResponse 方法

- `HttpResponse.json()`：返回 JSON 响应
- `HttpResponse.text()`：返回文本响应
- `HttpResponse.html()`：返回 HTML 响应

### 4.4 面向切面编程（AOP）

通过 `@Before`、`@After` 等装饰器，对请求前、请求后、请求错误等阶段进行拦截。

#### 4.4.1 切点表达式

用于指定切入位置的字符串，支持通配符 `*`：

1. `getUser*`：所有以 `getUser` 开头的方法
2. `UserApi.getUser*`：`UserApi` 类中所有以 `getUser` 开头的方法
3. `UserApi.*`：`UserApi` 类中所有的方法
4. `*`：所有的方法

#### 4.4.2 切入时机

- `@Before`：方法执行前
- `@After`：方法执行后（无论成功失败）
- `@Around`：方法执行前后（可控制是否继续执行）
- `@AfterReturning`：方法成功执行后
- `@AfterThrowing`：方法抛出异常后

#### 4.4.3 示例

```typescript
@Component()
@HttpApi('http://localhost:3000/api/users')
class UserApi {
  @Get({
    url: '/pages',
    mock: () => {
      return HttpResponse.json({ data: 'hello world' });
    },
  })
  getUserPages(): any {}
}

@Aspect(1)
class Logger {
  @Before('getUser*')
  log(ctx: AspectContext) {
    console.log('before getUser*');
  }

  @After('getUser*')
  logAfter(ctx: AspectContext) {
    console.log('after getUser*');
  }
}
```

### 4.5 子项装饰器

子项装饰器用于将配置从主装饰器中分离，使代码结构更清晰。

#### 4.5.1 @TransformResponse

用于处理响应数据：

```typescript
@HttpApi({
  refAxios: request,
})
class UserApi {
  @Get({ url: '/pages' })
  @TransformResponse([data => JSON.parse(data).data, data => data.map((user: any) => ({ ...user, age: 12 }))])
  getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
}
```

#### 4.5.2 配置优先级

`@Get` 中配置 > `@AxiosRef` 装饰器配置 > `@HttpApi` 装饰器配置 > `@RefAxios` 装饰器配置

### 4.6 依赖注入（DI）

通过 `@Inject` 装饰器与 IoC（控制反转）容器实现，用于解耦组件间的依赖关系，自动管理实例的创建和注入过程。

### 4.7 封装装饰器

可以封装自定义装饰器以复用配置：

```typescript
// 封装文件上传post
function FileUp(config: HttpMethodDecoratorConfig) {
  config.headers = {
    'Content-Type': 'multipart/form-data',
  };
  return Post(config);
}

// 只获取响应数据的data部分
function ExtractData() {
  return TransformResponse(() => (data: any) => data.data);
}

// 使用
@HttpApi('http://localhost:3000/users/')
class UserApi {
  @FileUp({ url: '/upload' })
  @ExtractData()
  avaterUpload(@BodyParam() form: FormData): any {}
}
```

## 5. 结合数据生成工具

结合 `data-faker-plus` 可以更高效地生成 mock 数据。

### 5.1 项目结构

```bash
project
 ├── api
 │   ├── common
 │   │   └── index.ts      # 通用接口装饰器
 │   └── userApi.ts        # 真实接口类
 └── mock
     ├── common
     │   └── index.ts      # 通用方法
     ├── models
     │   └── userModel.ts  # 定义数据模型
     └── userMock.ts       # 封装用户mock装饰器
```

### 5.2 定义数据模型

```typescript
// /mock/models/userModel.ts
import { DataField, DataModel, defineModel, faker } from 'data-faker-plus';

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

  // 更多字段...
}
```

### 5.3 封装 mock 装饰器

```typescript
// /mock/userMock.ts
import { HttpResponse, Mock, MockHandlers } from '@/index';
import { fakeData, useModel } from 'data-faker-plus';
import { UserModel } from './models/userModel';

// 生成假数据
const users = fakeData(useModel(UserModel), 30);

// 模拟用户分页查询
export function MockUserPages() {
  let handlers = {
    default: () => {
      return HttpResponse.json({
        message: 'success',
        data: users,
      });
    },
    error: () => HttpResponse.error(),
  };
  return Mock(handlers);
}
```

### 5.4 定义真实接口类

```typescript
// /api/userApi.ts
import { Delete, Get, Post } from '@/core/httpMethod';
import { HttpApi } from '@/core/ioc';
import { BodyParam, PathParam } from '@/core/params';
import { MockUserPages, MockUserDelete } from '../mock/userMock';

@HttpApi({
  baseURL: 'http://localhost:3000/api/users',
  mock: {
    on: true,
    condition: () => process.env.NODE_ENV === 'test',
  },
})
class UserApi {
  @Get('/pages/:page/:size')
  @MockUserPages()
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}

  @Delete('/:id')
  @MockUserDelete()
  deleteUser(@PathParam('id') id: number): any {}
}
```

## 6. 许可证

MIT
