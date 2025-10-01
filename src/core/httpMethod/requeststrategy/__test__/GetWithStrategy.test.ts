import { SignalController } from '@/core/common/signal/SignalController';
import { MethodDecoratorStateManager } from '@/core/common/statemanager';
import { HttpApi } from '@/core/ioc';
import { PathParam } from '@/core/params';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Get } from '../..';

const mdsm = new MethodDecoratorStateManager();
const server = setupServer(
  ...[
    http.get('http://localhost:3000/list/:name/:id', () => {
      return HttpResponse.json({
        message: 'http://localhost:3000/list/:name/:id',
      });
    }),
    http.get('http://localhost:3000/users/list/:name/:id', () => {
      return HttpResponse.json({
        message: 'http://localhost:3000/users/list/:name/:id',
      });
    }),
    http.get('http://localhost:4000/users/list/:name/:id', () => {
      return HttpResponse.json({
        message: 'http://localhost:4000/users/list/:name/:id',
      });
    }),
  ],
);

beforeAll(() => {
  server.listen();
});
afterAll(() => {
  server.close();
});
// 劫持axios函数，此后axios变为了mock函数
jest.mock('axios');
// axios声明为mock方法
const mockedAxios = axios as jest.MockedFunction<typeof axios>;
// 劫持定时器，需要手动推荐定时器时间
jest.useFakeTimers();

afterEach(() => {
  // 清理每次测试的状态
  jest.resetAllMocks();
});
describe('1. 加入防抖节流等功能进行测试', () => {
  test('1.1 启用请求重发功能，并使用默认值', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };

    // 模拟：失败、失败、成功
    mockedAxios
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        retry: true,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    const resultPromise = userApi.getUsers('1', 'xm');
    // 第一次请求（立即执行）
    await Promise.resolve(); // 让微任务队列执行

    // 第一次重试（100ms）
    jest.advanceTimersByTime(100);
    await Promise.resolve(); // 确保 Promise 回调执行
    // 第二次重试（200ms）
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    // 第三次重试（10000ms）
    jest.advanceTimersByTime(10000);
    await Promise.resolve();
    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(3);
    expect(result).toEqual(mockResponse);
  }, 13_000);

  test('1.2 启用请求重发功能，并传入数值作为重发次数', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };

    // 模拟：失败、失败、成功
    mockedAxios.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        retry: 2,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    const resultPromise = userApi.getUsers('1', 'xm');
    // 第一次请求（立即执行）
    await Promise.resolve(); // 让微任务队列执行

    // 第一次重试（100ms）
    jest.advanceTimersByTime(100);
    await Promise.resolve(); // 确保 Promise 回调执行
    // 第二次重试（200ms）
    jest.advanceTimersByTime(200);
    await Promise.resolve();

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockResponse);
  });
  test('1.3 启用请求重发功能，并传入数组作为重发次数和延时', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };

    // 模拟：失败、失败、成功
    mockedAxios.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        retry: {
          count: 2,
          delay: 200,
        },
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    const resultPromise = userApi.getUsers('1', 'xm');
    // 第一次请求（立即执行）
    await Promise.resolve(); // 让微任务队列执行

    // 第一次重试（100ms）
    jest.advanceTimersByTime(200);
    await Promise.resolve(); // 确保 Promise 回调执行
    // 第二次重试（200ms）
    jest.advanceTimersByTime(400);
    await Promise.resolve();

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockResponse);
  });
  test('1.4 启用请求重发功能，并设置信号量，取消和开启请求重发', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };

    // 模拟：失败、失败、成功
    mockedAxios.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(mockResponse);
    let retryController = new SignalController();
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        retry: {
          count: 4,
          signal: retryController.signal,
        },
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    const resultPromise = userApi.getUsers('1', 'xm');
    // 第一次请求（立即执行）
    await Promise.resolve(); // 让微任务队列执行

    // 第一次重试（100ms）
    jest.advanceTimersByTime(100);
    await Promise.resolve(); // 确保 Promise 回调执行
    // 取消重发
    retryController.abort();

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockResponse);
  });

  test('1.5 启用防抖功能，并使用默认值', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios.mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        debounce: true,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    let resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');

    // 延时100ms后执行
    jest.advanceTimersByTime(100);

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse);
  });
  test('1.6 启用防抖功能，并传入数值作为防抖延时', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios.mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        debounce: {
          delay: 1000,
        },
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    let resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');

    // 延时100ms后执行
    jest.advanceTimersByTime(1000);

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse);
  });
  test('1.7 启用防抖功能，传入信号量，模拟取消防抖', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);
    let debounceController = new SignalController();
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        debounce: {
          delay: 1000,
          signal: debounceController.signal,
        },
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    let resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    // 延时100ms后执行
    jest.advanceTimersByTime(1000);
    let result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse);
    // 取消防抖
    debounceController.abort();
    let data = await userApi.getUsers('1', 'xm');
    expect(data).toEqual(mockResponse);
    data = await userApi.getUsers('1', 'xm');
    expect(data).toEqual(mockResponse);
  });
  test.only('1.8 启用防抖功能，并立即先执行一次', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);
    let debounceController = new SignalController();
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        debounce: {
          delay: 1000,
          immediate: true,
        },
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    let resultPromise = userApi.getUsers('1', 'xm');
    // 先执行一次
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    // 延时100ms后执行
    jest.advanceTimersByTime(1000);
    let result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockResponse);
  });
  test('1.9 启用节流功能，并使用默认值', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);
    let debounceController = new SignalController();
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        throttle: true,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    // 执行第一次（直接执行）
    let resultPromise = userApi.getUsers('1', 'xm');
    // 延时100ms后执行
    resultPromise = userApi.getUsers('1', 'xm'); //0
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm'); //20
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm'); //40
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm'); //60
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm'); //80
    // 执行第二次（promise）
    jest.advanceTimersByTime(20);
    // 设置新的定时器
    resultPromise = userApi.getUsers('1', 'xm'); //100
    resultPromise = userApi.getUsers('1', 'xm'); //0
    // 第三次执行（promise）
    jest.advanceTimersByTime(100);
    resultPromise = userApi.getUsers('1', 'xm'); // 100
    resultPromise = userApi.getUsers('1', 'xm'); // 0
    // 第四次执行（promise）
    jest.advanceTimersByTime(100);
    resultPromise = userApi.getUsers('1', 'xm'); // 100
    resultPromise = userApi.getUsers('1', 'xm'); // 0

    let result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(5);
    expect(result).toEqual(mockResponse);
  });
  test('1.10 启用节流功能，并传入数值作为间隔', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        throttle: 200,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    // 执行第一次（直接执行）
    let resultPromise = userApi.getUsers('1', 'xm');
    // 延时100ms后执行
    resultPromise = userApi.getUsers('1', 'xm'); //0
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //20
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //40
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //60
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //80
    // 执行第二次（promise）
    jest.advanceTimersByTime(40);
    // 设置新的定时器
    resultPromise = userApi.getUsers('1', 'xm'); //100
    resultPromise = userApi.getUsers('1', 'xm'); //0
    // 第三次执行（promise）
    jest.advanceTimersByTime(200);
    resultPromise = userApi.getUsers('1', 'xm'); // 100
    resultPromise = userApi.getUsers('1', 'xm'); // 0
    // 第四次执行（promise）
    jest.advanceTimersByTime(200);
    resultPromise = userApi.getUsers('1', 'xm'); // 100
    resultPromise = userApi.getUsers('1', 'xm'); // 0

    let result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(5);
    expect(result).toEqual(mockResponse);
  });
  test('1.11 启用节流功能，并传入信号量', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };
    // 模拟：失败、失败、成功
    mockedAxios
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);
    let throttleController = new SignalController();
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        throttle: {
          interval: 200,
          signal: throttleController.signal,
        },
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    // 执行第一次（直接执行）
    let resultPromise = userApi.getUsers('1', 'xm');
    // 延时100ms后执行
    resultPromise = userApi.getUsers('1', 'xm'); //0
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //20
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //40
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //60
    jest.advanceTimersByTime(40);
    resultPromise = userApi.getUsers('1', 'xm'); //80
    // 执行第二次（promise）
    jest.advanceTimersByTime(40);
    // 取消节流
    throttleController.abort();
    // 执行第3次
    resultPromise = userApi.getUsers('1', 'xm');
    // 执行第4次
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(200);
    // 执行第5次
    resultPromise = userApi.getUsers('1', 'xm');
    // 执行第6次
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(200);
    // 执行第7次
    resultPromise = userApi.getUsers('1', 'xm');
    // 执行第8次
    resultPromise = userApi.getUsers('1', 'xm');

    let result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(8);
    expect(result).toEqual(mockResponse);
  });
});

describe('2. 防抖、节流分别与请求重试组合', () => {
  test('2.1 防抖和请求重试组合', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };

    // 模拟：失败、失败、成功
    mockedAxios
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        retry: true,
        debounce: true,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    let resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    jest.advanceTimersByTime(10000);

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(3);
    expect(result).toEqual(mockResponse);
  }, 20_000);

  test('2.2 节流和请求重试组合', async () => {
    const mockResponse = { message: 'http://localhost:8000/list/xm/1' };

    // 模拟：失败、失败、成功
    mockedAxios
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse);
    @HttpApi('http://localhost:8000')
    class UserApi {
      @Get({
        url: '/list/:name/:id',
        retry: true,
        throttle: true,
      })
      async getUsers(@PathParam('id') id: string, @PathParam('name') name: string): Promise<any> {}
    }
    const userApi = new UserApi();
    // 第一次请求会直接执行
    let resultPromise = userApi.getUsers('1', 'xm');
    // 然后执行第二个节流请求
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(100);
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(100);
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(100);

    await Promise.resolve();
    jest.advanceTimersByTime(100); // 1.1
    await Promise.resolve();
    jest.advanceTimersByTime(100); // 2.1
    await Promise.resolve();
    jest.advanceTimersByTime(100); // 3.1
    await Promise.resolve();
    jest.advanceTimersByTime(100); // 4.1
    await Promise.resolve();
    jest.advanceTimersByTime(200); //1.2
    await Promise.resolve();
    jest.advanceTimersByTime(200); //2.2
    await Promise.resolve();
    jest.advanceTimersByTime(200); //3.2
    await Promise.resolve();
    jest.advanceTimersByTime(200); //4.2
    await Promise.resolve();
    jest.advanceTimersByTime(10000); //1.3
    await Promise.resolve();

    const result = await resultPromise;
    expect(mockedAxios).toHaveBeenCalledTimes(5);
    expect(result).toEqual(mockResponse);
  }, 20_000);
});
