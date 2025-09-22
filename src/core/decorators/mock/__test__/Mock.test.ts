import axios from 'axios';
import { Get, HttpApi, PathParam } from '../..';
import { MockAPI } from '../../mock/MockAPI';
import { http, HttpResponse } from 'msw';
import { SignalController } from '@/core/signal/SignalController';

beforeAll(() => {
  MockAPI.on();
  MockAPI.registerHandlers(
    ...[
      http.get('http://localhost:3000/users/:name/:id', () => {
        return HttpResponse.json({
          message: 'http://localhost:3000/users/:name/:id/zs',
        });
      }),
    ],
  );
  // 模拟测试环境
  process.env.NODE_ENV = 'test';
});
afterEach(() => {
  MockAPI.resetHandlers();
  MockAPI.registerHandlers(
    ...[
      http.get('http://localhost:3000/users/:name/:id', () => {
        return HttpResponse.json({
          message: 'http://localhost:3000/users/:name/:id/zs',
        });
      }),
    ],
  );
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
    expect(MockAPI.listHandlers().length).toBe(4);
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
    expect(MockAPI.listHandlers().length).toBe(4);
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
    expect(data).toEqual({ message: 'welcome to use AxiosPlusMock' });
  });
  test('2.2 单独Get中进行mock配置，并采用单个处理器', async () => {
    @HttpApi(request)
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {
          handlers: {
            default: ({ params }) => {
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
    const { data: data2 } = await userApi.getUsers('test', 1)('default');
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
    expect(data2).toEqual({ message: 'http://localhost:3000/users/:name/:id' });
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
  test('2.4 方法中关闭mock，此时走真实接口', async () => {
    @HttpApi(request)
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {
          on: false,
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
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
  test('2.5 类中关闭mock，此时走真实接口（优先级低于方法）', async () => {
    @HttpApi({
      refAxios: request,
      mock: {
        on: false,
      },
    })
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
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
  test('2.6 方法中设置条件未达到，走真实接口', async () => {
    const mockUserApi = {
      getUsers: {
        success: () => {
          return HttpResponse.json({
            message: 'http://localhost:3000/users/:name/:id',
          });
        },
        fail: () => {
          return HttpResponse.json({
            message: 'http://localhost:3000/users/:name/:id',
          });
        },
      },
    };
    @HttpApi({
      refAxios: request,
      mock: {
        on: true,
      },
    })
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {
          condition: () => {
            return false;
          },
        },
        mockHandlers: mockUserApi.getUsers,
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)('success');
    const { data: fail } = await userApi.getUsers('test', 1)('fail');
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
  test('2.7 类中设置的条件未达到，走真实接口（优先级低于方法）', async () => {
    @HttpApi({
      refAxios: request,
      mock: {
        on: true,
        condition: () => {
          return false;
        },
      },
    })
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
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
  test('2.8 全局关闭所有mock接口关闭，走真实接口（优先级低于所有）', async () => {
    MockAPI.off();
    @HttpApi({
      refAxios: request,
    })
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
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
  test('2.9 全局设置条件未达到，走真实接口（优先级低于所有）', async () => {
    MockAPI.setCondition(() => {
      return process.env.NODE_ENV === 'development';
    });
    @HttpApi({
      refAxios: request,
    })
    class UserApi {
      @Get({
        url: '/users/:name/:id',
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1);
    const { data: fail } = await userApi.getUsers('test', 1);
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
  test('3.0 不设置mock走真实接口', async () => {
    MockAPI.setCondition(() => {
      return process.env.NODE_ENV === 'development';
    });
    @HttpApi({
      refAxios: request,
    })
    class UserApi {
      @Get({
        url: '/users/:name/:id',
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1);
    const { data: fail } = await userApi.getUsers('test', 1);
    expect(data).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
    expect(fail).toEqual({ message: 'http://localhost:3000/users/:name/:id/zs' });
  });
});
