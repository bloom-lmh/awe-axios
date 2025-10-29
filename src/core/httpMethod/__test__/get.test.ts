import { setupServer } from 'msw/node';
import { HttpApi } from '@/core/ioc';
import { axiosPlus, BodyParam, Get, PathParam, Post, QueryParam } from '@/index';
import { delay, http, HttpResponse } from 'msw';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { de, IteratorFactory } from 'data-faker-plus';
import { SignalController } from '@/core/common/signal/SignalController';
import { custom } from 'joi';
import { useRetry } from '../requeststrategy/Retry';
import { useDebounce } from '../requeststrategy/Debounce';
import { useThrottle } from '../requeststrategy/Throttle';
const jsonData = IteratorFactory.getIterator([
  HttpResponse.error(),
  HttpResponse.error(),
  HttpResponse.json({
    data: 'a',
  }),
]);
const throttleRetryData = IteratorFactory.getIterator([
  HttpResponse.error(),
  HttpResponse.error(),
  HttpResponse.error(),
  HttpResponse.json({
    data: '1',
  }),
  HttpResponse.error(),
  HttpResponse.error(),
  HttpResponse.error(),
  HttpResponse.json({
    data: '2',
  }),
  HttpResponse.json({
    data: '3',
  }),
]);
const handlers = [
  http.get('http://localhost:3000/users/pages', ({ request }) => {
    console.log(request.url);
    return HttpResponse.json({
      data: 'a',
    });
  }),

  http.get('http://localhost:3000/users/groups', ({ request }) => {
    console.log(request.url);
    return HttpResponse.json({
      data: 'a',
    });
  }),

  http.get('http://localhost:3000/users/:id', ({ request }) => {
    console.log(request.url);
    return HttpResponse.json({
      data: 'a',
    });
  }),

  http.post('http://localhost:3000/users/', async ({ request }) => {
    const user = await request.json();
    console.log(user);

    return HttpResponse.json({
      data: 'a',
    });
  }),

  http.post('http://localhost:3000/users/upload', async ({ request }) => {
    const form = await request.formData();
    console.log(form);
    return HttpResponse.json({
      data: 'a',
    });
  }),

  http.get('http://localhost:3000/users/retry/:id', async ({ request }) => {
    console.log('a');

    return jsonData.next().value;
  }),

  http.get('http://localhost:3000/users/debounce/:id', async ({ request }) => {
    console.log('a');

    return HttpResponse.json({
      data: 'a',
    });
  }),

  http.get('http://localhost:3000/users/throttle/:id', async ({ request }) => {
    console.log('a');

    return HttpResponse.json({
      data: 'a',
    });
  }),
  http.get('http://localhost:3000/users/throttleRetry/:id', async ({ request }) => {
    return throttleRetryData.next().value;
  }),
];
const worker = setupServer(...handlers);
beforeAll(() => {
  worker.listen();
});
afterAll(() => {
  worker.close();
});

describe('@Get装饰器测试', () => {
  test('1. 基本查询测试', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000/users/',
    })
    class UserApi {
      // 等价于http://localhost:3000/users/pages?size=20&page=1
      @Get('/pages')
      getUserPages(@QueryParam('page') page: number, @QueryParam('size') size: number): any {}

      // 等价于http://localhost:3000/users/groups?ids[]=2&ids[]=1
      @Get('/groups')
      getUserGroups(@QueryParam('ids') id1: number, @QueryParam('ids') id2: number): any {}

      @Get('/:id')
      getUserById(@PathParam('id') id: number): any {}

      @Post('/')
      createUser(@BodyParam() user: { name: string; age: number }, @BodyParam() person: { sex: string }): any {}

      @Post({
        url: '/upload',
        headers: {
          'Content-Type': 'mutilpart/form-data',
        },
      })
      uploadFile(@BodyParam('file') file: FormData): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUserPages(1, 20);
    console.log(data);

    const { data: data2 } = await userApi.getUserGroups(1, 2);
    console.log(data2);

    const { data: data3 } = await userApi.getUserById(1);
    console.log(data3);

    const { data: data4 } = await userApi.createUser({ name: 'test', age: 18 }, { sex: '男' });
    console.log(data4);

    const form = new FormData();
    form.append('file', new File(['test'], 'test.txt'));
    const { data: data5 } = await userApi.uploadFile(form);
  });

  test('2. 请求重发', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000/users/',
    })
    class UserApi {
      @Get({
        url: '/retry/:id',
      })
      getUserById(@PathParam('id') id: number): any {}
    }

    // 取消重传
    const userApi = new UserApi();
    async function getUserById(id: number) {
      const { data } = await userApi.getUserById(id);
    }
    const retryGetUserById = useRetry(getUserById, {
      delay: 1000,
    });
    await retryGetUserById(1);
  });

  test('3. 防抖', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000/users/',
    })
    class UserApi {
      @Get({
        url: '/debounce/:id',
      })
      getUserById(@PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    async function getUserById(id: number) {
      const { data } = await userApi.getUserById(id);
      console.log(data);
    }
    const fn = useDebounce(getUserById);
    fn(1);
    fn(2);
    fn(3);
    fn(4);
    await fn(5);
  });

  test('4. 节流', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000/users/',
    })
    class UserApi {
      @Get({
        url: '/throttle/:id',
      })
      getUserById(@PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    // 真实接口调用
    async function getUserById(id: number) {
      const { data } = await userApi.getUserById(id);
      console.log(data);
    }
    // 节流函数
    const fn = useThrottle(getUserById);
    // 默认100ms的执行间隔，所以下面实际调用3次接口
    fn(1);
    fn(2);
    await delay(100);
    fn(3);
    fn(4);
    await delay(100);
    fn(5);
    fn(6);
  });
  test.only('5. 节流+重试', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000/users/',
    })
    class UserApi {
      @Get({
        url: '/throttleRetry/:id',
      })
      getUserById(@PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    // 真实接口调用
    async function getUserById(id: number) {
      const { data } = await userApi.getUserById(id);
      console.log(data);
    }
    // 节流函数
    const fn = useThrottle(useRetry(getUserById));
    // 默认100ms的执行间隔，所以下面实际调用3次接口
    fn(1);
    fn(2);
    await delay(1000);
    fn(3);
    fn(4);
    await delay(1000);
    fn(5);
    fn(6);
    fn(6);
  });
});
