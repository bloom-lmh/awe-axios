import { HttpResponse } from 'msw';
import { BodyParam, Get, HttpApi, PathParam, Post } from '../..';
import { MockAPI } from '../../mock/MockAPI';

beforeAll(() => {
  MockAPI.on();
  // 模拟测试环境
  process.env.NODE_ENV = 'test';
});
afterEach(() => {
  MockAPI.resetHandlers();
});
afterAll(() => {
  MockAPI.off();
});

describe('1.Mock流程测试', () => {
  test('1.1 能够对正常基本路径进行单个处理器注册', async () => {
    interface User {
      name: string;
      id: number;
    }
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Post({
        url: '/',
        mock: {
          handlers: ctx => {
            console.log(ctx);
            return HttpResponse.json({
              message: 'http://localhost:3000/users/',
            });
          },
        },
      })
      saveUser(@BodyParam('user') user: User): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.saveUser({
      name: 'test',
      id: 1,
    })();
    console.log(data);
  });
});
