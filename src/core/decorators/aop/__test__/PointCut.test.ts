import { After, AfterReturning, AfterThrowing, Around, Aspect, Before } from '..';
import { AdviceChain } from '../AdviceChain';
import { AspectContext } from '../AspectContext';
import { Component, Get, HttpApi, PathParam } from '../..';

import { MockAPI } from '../../mock/MockAPI';
import { HttpResponse } from 'msw';
import { AspectProcessor } from '../AspectProcessor';
beforeAll(() => {
  MockAPI.on();
});
afterAll(() => {
  MockAPI.off(true);
});
describe('PointCut装饰器工厂流程测试', () => {
  test.each([
    { exp: '*' },
    { exp: 'get*' },
    { exp: 'getUsers' },
    { exp: '*.*' },
    { exp: 'UserApi.*' },
    { exp: 'UserApi.get*' },
    { exp: 'User*.getUsers' },
    { exp: '*.getUsers' },
    { exp: '*.*.*' },
    { exp: '*.UserApi.*' },
    { exp: '*.UserApi.get*' },
    { exp: '*.UserApi.getUsers' },
    { exp: '*.*.get*' },
    { exp: '*.User*.get*' },
  ])('能够正确解析表达式为表达式对象', ({ exp }) => {
    class Aspect {
      @Before(exp)
      test() {}
    }
  });

  test.only('能够正确记录通知表达式对象和通知方法', async () => {
    @Component('api.userApi')
    @HttpApi({
      baseURL: 'http://localhost:3000/api',
      url: '/users',
    })
    class UserApi {
      @Get({
        url: '/',
        mock: () => {
          return HttpResponse.json({
            data: 'a',
            message: 'http://localhost:3000/api/users',
          });
        },
      })
      getUsers(): any {}
      /* @Get('/:id') getUserById(@PathParam('id') id: number) {} */
    }

    @Aspect(1)
    class Aspect1 {
      @Before('*.getUsers')
      test(context: AspectContext) {
        console.log('Aspect1的前置1通知执行');
      }

      @Before('*.getUsers')
      test2(context: AspectContext) {
        console.log('Aspect1的前置2通知执行');
      }

      @Around('*.getUsers')
      test3(context: AspectContext, chain: AdviceChain) {
        console.log('Aspect1的around1-before通知执行');
        const result = chain.proceed(context);
        console.log('Aspect1的around1-after通知执行');
        return result;
      }

      @Around('*.getUsers')
      test4(context: AspectContext, adviceChain: AdviceChain) {
        console.log('Aspect1的around2-before通知执行');
        const result = adviceChain.proceed(context);
        console.log('Aspect1的around2-after通知执行');
      }

      @After('*.getUsers')
      test5(context: AspectContext) {
        console.log('Aspect1的后置1通知执行');
      }
      @After('*.getUsers')
      test6(context: AspectContext) {
        console.log('Aspect1的后置2通知执行');
      }
      @AfterReturning('*.getUsers')
      test7(context: AspectContext, result: any) {
        console.log('Aspect1的后置返回通知1执行', result);
      }
      @AfterReturning('*.getUsers')
      test8(context: AspectContext, result: any) {
        console.log('Aspect1的后置返回通知2执行', result);
      }
      /*  @AfterThrowing('*.getUsers')
      test8(context: AspectContext, tx: Error) {} */
    }

    @Aspect(2)
    class Aspect2 {
      @Before('*.getUsers')
      test(context: AspectContext) {
        console.log('Aspect2的前置1通知执行');
      }

      @Before('*.getUsers')
      test2(context: AspectContext) {
        console.log('Aspect2的前置2通知执行');
      }

      @Around('*.getUsers')
      test3(context: AspectContext, chain: AdviceChain) {
        console.log('Aspect2的around1-before通知执行');
        const result = chain.proceed(context);
        console.log('Aspect2的around1-after通知执行');
        return result;
      }

      @Around('*.getUsers')
      test4(context: AspectContext, adviceChain: AdviceChain) {
        console.log('Aspect2的around2-before通知执行');
        const result = adviceChain.proceed(context);
        console.log('Aspect2的around2-after通知执行');
      }

      @After('*.getUsers')
      test5(context: AspectContext) {
        console.log('Aspect2的后置1通知执行');
      }
      @After('*.getUsers')
      test6(context: AspectContext) {
        console.log('Aspect2的后置2通知执行');
      }
      @AfterReturning('*.getUsers')
      test7(context: AspectContext, result: any) {
        console.log('Aspect2的后置返回通知1执行', result);
      }
      @AfterReturning('*.getUsers')
      test8(context: AspectContext, result: any) {
        console.log('Aspect2的后置返回通知2执行', result);
      }
    }
    AspectProcessor.weave();
    let userApi = new UserApi();
    const { data } = await userApi.getUsers()();
    console.log(data);
  });
});
