import { Get } from '@/core/httpMethod';
import { HttpApi } from '@/core/ioc';
import { afterAll, afterEach, beforeAll, test } from 'vitest';
import { Mock } from '..';
import { HttpResponse } from 'msw';
import { MockAPI } from '../MockAPI';
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
test('adds 1 + 2 to equal 3', async () => {
  @HttpApi({
    baseURL: 'http://localhost:3000',
  })
  class UserApi {
    @Get({
      url: '/list',
      mock: {
        handlers: {
          success: () => {
            return HttpResponse.json({
              message: 'a',
            });
          },
        },
      },
    })
    getUserList(): any {}
  }
  let userApi = new UserApi();
  const { data } = await userApi.getUserList()('success');
  console.log(data);
});
