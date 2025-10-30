import { HttpApi } from '@/core/ioc';
import { beforeAll, describe, test } from 'vitest';
import { Get } from '..';
import { HttpResponse, MockAPI } from '@/index';

beforeAll(() => {
  MockAPI.on();
});
describe('Mock test', () => {
  test('单处理器', async () => {
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
  });
  test('多处理器', async () => {
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
  });
});
