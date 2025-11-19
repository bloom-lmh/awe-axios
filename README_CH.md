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

## 基本使用

### 准备项目结构

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

### 定义数据模型

这里数据模型通过`data-faker-plus`来定义，在`/mock/models/userModel.ts`

```ts
import { DataField, DataModel, defineModel, faker } from 'data-faker-plus';

// 定义用户数据模型
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
这里我推荐大家使用`data-faker-plus`来完成数据模拟。有关`data-faker-plus`的使用方法，请参考

1. [npm](https://www.npmjs.com/package/data-faker-plus)
2. [github](https://github.com/bloom-lmh/data-faker)
3. [中文官网](https://datafaker-9j23z0sk.maozi.io/)
4. [英文官网](https://df-docs-seven.vercel.app/)
   :::

### 封装 mock 装饰器

#### 定义通用方法

`/mock/common/index.ts`,在这里面定义了通用错误处理方法

```ts
/**
 * 公共方法
 */

import { HttpResponse } from 'msw';

/**
 * 网络错误
 * @returns
 */
export function netWorkError() {
  return HttpResponse.error();
}
```

#### 定义用户 mock 装饰器

`/mock/userMock.ts`，在这里面定义了用户相关的`mock`装饰器

```ts
import { HttpResponse, Mock, MockHandlers } from '@/index';
import { fakeData, useModel } from 'data-faker-plus';
import { UserModel } from './models/userModel';
import { netWorkError } from './common';

// 使用data-faker-plus生成假数据
const users = fakeData(useModel(UserModel), 30);
/**
 * 模拟用户页面
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
 * 模拟删除用户
 */
export function MockUserDelete() {
  let handlers: MockHandlers = {
    default: ({ params }) => {
      // 获取用户参数
      const { id } = params;
      // 找到用户
      const user = users.find((item: any) => item.id === id);
      // 删除用户
      users.splice(users.indexOf(user), 1);
      // 返回成功信息
      return HttpResponse.json({
        message: 'delete success',
      });
    },
    error: netWorkError,
  };
  return Mock(handlers);
}

/**
 * 模拟更新用户
 */
export function MockUserUpdate() {
  // 成功时的方法
  const success: MockHandlers = async ({ request }) => {
    // 获取请求体参数
    let user = await request.json();
    user = JSON.parse(JSON.stringify(user)) as UserModel;

    if (!user || !user.id) {
      return HttpResponse.json({
        status: 400,
        message: 'params error',
      });
    }
    // 更新用户信息
    const index = users.findIndex((item: any) => item.id === user.id);
    users[index] = user;
    return HttpResponse.json({
      message: 'update success',
    });
  };
  // 失败时的方法
  const error = netWorkError;
  // 返回 Mock 装饰器
  return Mock({
    default: success,
    error,
  });
}

/**
 * 添加用户
 */
export function MockUserCreate() {
  // 成功时的方法
  const success: MockHandlers = async ({ request }) => {
    // 获取请求体参数
    let user = await request.json();
    // 新增用户
    users.unshift(user);
    return HttpResponse.json({
      message: 'create success',
    });
  };
  // 失败时的方法
  const error = netWorkError;
  // 返回 Mock 装饰器
  return Mock({
    default: success,
    error,
  });
}
```

### 封装接口装饰器

`/api/common/index.ts`

```ts
import { HttpMethodDecoratorConfig, Post } from '@/index';

/**
 * 分页查询装饰器
 * @param config 请求配置
 * @returns post装饰器
 */
export function Pages(config: HttpMethodDecoratorConfig) {
  config.headers = {
    'Content-Type': 'application/json',
  };
  return Post(config);
}
```

### 定义真实接口类

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
   * 用户分页查询接口
   * @param page 页号
   * @param size 每页数量
   */
  @Pages({ url: '/pages/:page/:size' })
  @MockUserPages()
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}

  /**
   * 删除用户接口
   * @param id 用户ID
   */
  @Delete('/:id')
  @MockUserDelete()
  deleteUser(@PathParam('id') id: number): any {}

  /**
   * 添加用户接口
   */
  @Post('/')
  @MockUserCreate()
  addUser(@BodyParam() user: { name: string; age: number }): any {}

  /**
   * 更新用户接口
   */
  @Put('/')
  @MockUserUpdate()
  updateUser(@BodyParam() user: { id: number; name: string; age: number }): any {}
}

export const userApi = new UserApi();
```

### 调用接口测试

打开`mock`开关，测试接口是否正常工作

```ts
// 一定要先开启mock开关
MockAPI.on();
const { data } = await userApi.getUserPages(1, 10)();
console.log(data);
// 删除用户
const { data: data2 } = await userApi.deleteUser(1)();
console.log(data2);
// 新增用户
const { data: data3 } = await userApi.addUser({ name: 'test', age: 18 })();
console.log(data3);
```
