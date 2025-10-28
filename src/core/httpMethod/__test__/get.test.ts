import { setupServer } from 'msw/node';
import { HttpApi } from '@/core/ioc';
import { BodyParam, Get, PathParam, Post, QueryParam } from '@/index';
import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, describe, test } from 'vitest';

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
      createUser(
        @BodyParam('user') user: { name: string; age: number },
        @BodyParam('person') person: { sex: string },
      ): any {}
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
  });
});
