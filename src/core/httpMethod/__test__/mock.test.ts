import { HttpApi } from '@/core/ioc';
import { beforeAll, describe, test } from 'vitest';
import { Get, Post } from '..';
import { BodyParam, HttpResponse, MockAPI, PathParam, QueryParam } from '@/index';
import { SignalController } from '@/core/common/signal/SignalController';
import { http } from 'msw';

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
  test('接受查询参数', async () => {
    @HttpApi('http://localhost:3000/users')
    class UserApi {
      @Get({
        url: '/pages',
        mock: ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get('page');
          const size = url.searchParams.get('size');
          // 1,10
          console.log(page, size);
          return HttpResponse.json({
            data: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          });
        },
      })
      getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}
    }
    let userApi = new UserApi();
    let { data } = await userApi.getUserPages(1, 10)();
    console.log(data);
  });
  test('接受路径参数', async () => {
    @HttpApi('http://localhost:3000/users/')
    class UserApi {
      @Get({
        url: '/pages/:page/:size',
        mock: ({ params }) => {
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
      })
      getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}
    }
    let userApi = new UserApi();
    let { data } = await userApi.getUserPages(1, 10)();
    console.log(data);
  });
  test('接受请求体参数', async () => {
    @HttpApi('http://localhost:3000/users/')
    class UserApi {
      @Post({
        url: '/pages/:page/:size',
        mock: async ({ request }) => {
          const data = await request.json();
          const { page, size } = data as { page: number; size: number };
          // 1,10
          console.log(page, size);
          return HttpResponse.json({
            data: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          });
        },
      })
      getUserPages(@BodyParam() qo: { page: number; size: number }): any {}
    }
    let userApi = new UserApi();
    let { data } = await userApi.getUserPages({ page: 1, size: 10 })();
    console.log(data);
  });
  test('mockHandlers', async () => {
    @HttpApi('http://localhost:3000/users/')
    class UserApi {
      @Post({
        url: '/pages/:page/:size',
        mockHandlers: {
          success: async ({ request }) => {
            const data = await request.json();
            const { page, size } = data as { page: number; size: number };
            // 1,10
            console.log(page, size);
            return HttpResponse.json({
              data: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
              ],
            });
          },
          error: () => {
            return HttpResponse.error();
          },
          default: () => {
            return HttpResponse.json({
              data: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
              ],
            });
          },
        },
      })
      getUserPages(@BodyParam() qo: { page: number; size: number }): any {}
    }
    let userApi = new UserApi();
    let { data } = await userApi.getUserPages({ page: 1, size: 10 })('success');
    console.log(data);
  });
  MockAPI.registerHandlers(
    http.get('http://localhost:3000/users/pages/:page/:size', ({ request, params }) => {
      const { page, size } = params;
      console.log('真实接口');
      console.log(request.url);
      console.log(page, size);
      return HttpResponse.json({
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      });
    }),
  );
  test('信号量机制取消mock', async () => {
    // 创建mock控制器
    const mockCtr = new SignalController();
    @HttpApi('http://localhost:3000/users/')
    class UserApi {
      @Get({
        url: '/pages/:page/:size',
        mock: {
          signal: mockCtr.signal,
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
    // 取消mock（走真实的接口）
    mockCtr.abort();
    // 发送到服务器真实接口 ： http://localhost:3000/users/pages/1/20
    let { data: data2 } = await userApi.getUserPages(1, 20)();
  });
});
