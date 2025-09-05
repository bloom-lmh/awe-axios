import { AspectDecoratorStateManager } from '@/core/statemanager/aop/AspectDecoratorStateManager';
import { After, AfterReturning, AfterThrowing, Around, Aspect, Before } from '..';
import { AdviceChain } from '../AdviceChain';
import { AspectContext } from '../AspectContext';
import { Component, Get, HttpApi, PathParam } from '../..';
import { AspectProcessor } from '../AspectProcessor';
let stateManager = new AspectDecoratorStateManager();
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

  test.only('能够正确记录通知表达式对象和通知方法', () => {
    @Component('api.userApi')
    @HttpApi('/api')
    class UserApi {
      @Get('/users') getUsers(@PathParam('id') id: number) {}
      @Get('/users/:id') getUserById() {}
    }

    @Aspect(1)
    class Aspect1 {
      @Before('*.getUsers')
      test(context: AspectContext) {}

      @Before('get*')
      test2(context: AspectContext) {}

      @Around('asda')
      test3(context: AspectContext) {}

      @Around('UserApi.*')
      test4(context: AspectContext, adviceChain: AdviceChain) {}

      @After('UserApi.get*')
      test5(context: AspectContext) {}

      @AfterReturning('*.getUsers')
      test6(context: AspectContext, result: any) {}

      @AfterThrowing('get*')
      test7(context: AspectContext, tx: Error) {}
    }

    @Aspect(2)
    class Aspect2 {
      @Before('*.getUsers')
      test(context: AspectContext) {}

      @Before('get*')
      test2(context: AspectContext) {}

      @Around('asda')
      test3(context: AspectContext) {}

      @Around('UserApi.*')
      test4(context: AspectContext, adviceChain: AdviceChain) {}

      @After('UserApi.get*sers')
      test5(context: AspectContext) {}

      @AfterReturning('*.getUsers')
      test6(context: AspectContext, result: any) {}

      @AfterThrowing('get*')
      test7(context: AspectContext, tx: Error) {}
    }
    AspectProcessor.weave();
  });
});
