import { HttpResponse } from 'msw';
import { BodyParam, Get, HttpApi, PathParam, Post } from '../..';
import { MockAPI } from '../../mock/MockAPI';
import axios from 'axios';
import { ProxyFactory } from '../../ioc/ProxyFactory';
import { useRetry } from '@/core/requeststrategy/Retry';

beforeAll(() => {
  MockAPI.on();
  // 模拟测试环境
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  MockAPI.off();
});

describe('1.Post测试', () => {
  test('1.1 发送json数据', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Post({
        url: '/',
        mock: {
          handlers: async ({ request }) => {
            const data = await request.json();
            return HttpResponse.json({
              data,
              message: 'http://localhost:3000/users/',
            });
          },
        },
      })
      saveUser(@BodyParam('name') userName: string, @BodyParam('id') userId: number): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.saveUser('test', 1)();
    console.log(data);
  });

  test('1.2 发送 URLSearchParams', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Post({
        url: '/profile',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        mock: {
          handlers: async ({ request }) => {
            const raw = await request.text();
            const params = new URLSearchParams(raw);

            return HttpResponse.json({
              success: 'ok',
              data: {
                params: Object.fromEntries(params.entries()),
              },
            });
          },
        },
      })
      uploadProfile(@BodyParam() data: URLSearchParams): any {}
    }

    const userApi = new UserApi();
    // 手动构造 FormData（或框架自动处理）
    const params = new URLSearchParams();
    params.append('param1', 'value1');
    params.append('param2', 'value2');

    // 假设你的装饰器框架支持传入 { username, avatar } 并自动转为 FormData
    const { data } = await userApi.uploadProfile(params)();
    console.log(data);
  });
  // 模拟一个文件（在测试中）
  test.only('1.3 发送多部分表单数据包含文件', async () => {
    const mockFile = new File(['fake content'], 'avatar.jpg', { type: 'image/jpeg' });

    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Post({
        url: '/profile',
        retry: true,
        customRetry: useRetry,
        mock: async ({ request }) => {
          const formData = await request.formData();
          const file = formData.get('avatar');
          const username = formData.get('username');
          const password = formData.get('password');
          console.log(file); // 输出：File { name: "avatar.jpg", type: "image/jpeg" }
          return HttpResponse.json({
            success: 'ok',
            data: {
              username,
              password,
            },
          });
        },
      })
      uploadProfile(@BodyParam() data: FormData): any {}
    }

    const userApi = new UserApi();
    // 手动构造 FormData（或框架自动处理）
    const formData = new FormData();
    formData.append('username', 'test');
    formData.append('password', '123456');
    formData.append('avatar', mockFile);

    // 假设你的装饰器框架支持传入 { username, avatar } 并自动转为 FormData
    const { data } = await userApi.uploadProfile(formData)();
    console.log(data);
  });
});
