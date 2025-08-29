import { HttpApi, Get, PathParam } from '@/core/decorators';
import { SignalController } from '@/core/signal/SignalController';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

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
describe.only('5. 加入防抖节流等功能进行测试', () => {
  test('5.1 启用请求重发功能，并使用默认值', async () => {
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

  test('5.2 启用请求重发功能，并传入数值作为重发次数', async () => {
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
  test('5.3 启用请求重发功能，并传入数组作为重发次数和延时', async () => {
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
  test('5.4 启用请求重发功能，并设置信号量，取消和开启请求重发', async () => {
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

  test('5.5 启用防抖功能，并使用默认值', async () => {
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
  test('5.6 启用防抖功能，并传入数值作为防抖延时', async () => {
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
  test('5.7 启用防抖功能，传入信号量，模拟取消防抖', async () => {
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

  test.only('5.8 启用节流功能，并使用默认值', async () => {
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
    // 第一次直接执行
    let resultPromise = userApi.getUsers('1', 'xm');
    // 延时100ms后执行
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(20);
    // 点击最后一次距离执行还剩20秒
    resultPromise = userApi.getUsers('1', 'xm');
    // 向前推进20秒，立刻点击，这时走promise，也走了第一个条件，会连续执行两次
    jest.advanceTimersByTime(20);
    resultPromise = userApi.getUsers('1', 'xm');

    // 向前推进10秒
    /*    jest.advanceTimersByTime(10);
    // 所以距离上次发送请求过去了10秒剩余90秒
    resultPromise = userApi.getUsers('1', 'xm');
    // 向前推进100秒，触发promise  第三次执行
    jest.advanceTimersByTime(100); */

    /*    resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(100); */
    /*  resultPromise = userApi.getUsers('1', 'xm');
    resultPromise = userApi.getUsers('1', 'xm');
    jest.advanceTimersByTime(100); */
    let result = await resultPromise;
    // 节流每100毫秒执行1次,第一次立即执行，然后后续都是间隔100毫秒执行一次，所以只执行了4次
    expect(mockedAxios).toHaveBeenCalledTimes(3);
    expect(result).toEqual(mockResponse);
  });
  test('5.9 启用节流功能，并传入数值作为间隔', async () => {});
  test('5.10 启用节流功能，并传入信号量', async () => {});
  test('5.11 启用节流功能，并传入对象', async () => {});
});
