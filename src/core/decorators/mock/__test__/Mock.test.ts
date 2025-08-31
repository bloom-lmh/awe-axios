import axios from 'axios';
import { Get, HttpApi, PathParam } from '../..';
import { MockAPI } from '../../mock/MockAPI';
import { http, HttpResponse } from 'msw';

beforeAll(() => {
  MockAPI.on();
  /*   MockAPI.registerHandlers(
    ...[
      http.get('http://localhost:3000/users/:name/:id', () => {
        return HttpResponse.json({
          data: 'http://localhost:3000/users/:name/:id',
        });
      }),
    ],
  ); */
  // 模拟测试环境
  process.env.NODE_ENV = 'test';
});
afterEach(() => {
  MockAPI.resetHandlers();
});
afterAll(() => {
  MockAPI.off();
});
const request = axios.create({
  baseURL: 'http://localhost:3000',
});
describe('1.Mock流程测试', () => {
  test('1.1 能够对正常基本路径进行单个处理器注册', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: '/:name/:id',
        mock: {
          handlers: ({ params }) => {
            console.log('aaa');
            return HttpResponse.json({
              message: 'http://localhost:3000/users/:name/:id',
            });
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)();
    expect(MockAPI.listHandlers().length).toBe(2);
    console.log(MockAPI.listHandlers());
  });
  test('1.2 能够对正常基本路径进行多个处理器注册', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: '/:name/:id',
        mock: {
          handlers: {
            success: ({ params }) => {
              return HttpResponse.json({
                message: 'http://localhost:3000/users/:name/:id',
              });
            },
            fail: ({ params }) => {
              return HttpResponse.json({
                message: 'http://localhost:3000/users/:name/:id',
              });
            },
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)();
    expect(MockAPI.listHandlers().length).toBe(3);
  });
  test('1.3 能够对url为绝对路径时进行单个处理器注册', async () => {
    @HttpApi({
      baseURL: 'http://localhost:4000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: 'http://localhost:3000/users/:name/:id',
        allowAbsoluteUrls: true,
        mock: {
          handlers: ({ params }) => {
            return HttpResponse.json({
              message: 'http://localhost:3000/users/:name/:id',
            });
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)();
    console.log(MockAPI.listHandlers());
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
    expect(MockAPI.listHandlers().length).toBe(2);
  });
  test('1.4 能够对url为绝对路径时进行多个处理器注册', async () => {
    @HttpApi({
      baseURL: 'http://localhost:4000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: 'http://localhost:3000/users/:name/:id',
        allowAbsoluteUrls: true,
        mock: {
          handlers: {
            success: ({ params }) => {
              return HttpResponse.json({
                message: 'http://localhost:3000/users/:name/:id',
              });
            },
            fail: ({ params }) => {
              return HttpResponse.json({
                message: 'http://localhost:3000/users/:name/:id',
              });
            },
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)('success');
    const { data: data2 } = await userApi.getUsers('test', 1)('success');
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
    expect(data2).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
    expect(MockAPI.listHandlers().length).toBe(3);
  });
});
describe('2.Mock Get方法测试', () => {
  test('2.1 单独Get中进行mock配置，并采用默认的处理器', async () => {
    @HttpApi(request)
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {},
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)();
    console.log(data);
    expect(data).toEqual({ message: '欢迎开启Mock，你可以自定义拦截器完成你想要的mock数据', data: {} });
  });
  test('1.2 单独Get中进行mock配置，并采用单个处理器', async () => {
    @HttpApi(request)
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {
          handlers: ({ params }) => {
            return HttpResponse.json({
              message: 'http://localhost:3000/users/:name/:id',
            });
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)();

    /*  const { data: data2 } = await userApi.getUsers('test', 1)('default');
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
    expect(data2).toEqual({ message: 'http://localhost:3000/users/:name/:id' }); */
  });
  test('2.3 单独Get中进行mock配置，并采用多个处理器', async () => {
    @HttpApi(request)
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {
          handlers: {
            success: ({ params }) => {
              return HttpResponse.json({
                message: 'http://localhost:3000/users/:name/:id',
              });
            },
            fail: ({ params }) => {
              return HttpResponse.json({
                message: 'http://localhost:3000/users/:name/:id',
              });
            },
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)('success');
    const { data: fail } = await userApi.getUsers('test', 1)('fail');
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
  });
});
