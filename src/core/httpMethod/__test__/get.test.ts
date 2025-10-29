import { setupServer } from 'msw/node';
import { HttpApi } from '@/core/ioc';
import { BodyParam, Get, PathParam, Post, QueryParam } from '@/index';
import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, describe, test } from 'vitest';
import { IteratorFactory } from 'data-faker-plus';
import { SignalController } from '@/core/common/signal/SignalController';
const jsonData = IteratorFactory.getIterator([
  HttpResponse.error(),
  HttpResponse.error(),
  HttpResponse.json({
    data: 'a',
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
    return jsonData.next().value;
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

  test.only('2. 超时重传', async () => {
    const retrySignalCtr = new SignalController();

    @HttpApi({
      baseURL: 'http://localhost:3000/users/',
    })
    class UserApi {
      @Get({
        url: '/retry/:id',
        retry: {
          signal: retrySignalCtr.signal,
        },
      })
      getUserById(@PathParam('id') id: number): any {}
    }
    retrySignalCtr.abort();
    console.log(retrySignalCtr.signal.isAborted());

    const userApi = new UserApi();
    const { data } = await userApi.getUserById(1);
    console.log(data);
  });
});
