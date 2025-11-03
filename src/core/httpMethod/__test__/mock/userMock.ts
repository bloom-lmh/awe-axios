import { HttpResponse, Mock, MockHandlers } from '@/index';
import { fakeData, useModel } from 'data-faker-plus';
import { UserModel } from './models/userModel';
import { netWorkError } from './common';

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
