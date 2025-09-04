import { AspectDecoratorStateManager } from '@/core/statemanager/aop/AspectDecoratorStateManager';
import { After, AfterReturning, AfterThrowing, Around, Aspect, Before } from '..';
import { AdviceChain } from '../AdviceChain';
import { AopContext } from '../AopContext';
import { AopProcessor } from '../AopProcessor';
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
    class Aop {
      @Before(exp)
      test() {}
    }
  });

  test.only('能够正确记录通知表达式对象和通知方法', () => {
    @Aspect(1)
    class Aop {
      @Before('*.getUsers')
      test(context: AopContext) {}

      @Before('get*')
      test2(context: AopContext) {}

      @Around('asda')
      test3(context: AopContext) {}

      @Around('UserApi.*')
      test4(context: AopContext, adviceChain: AdviceChain) {}

      @After('UserApi.get*')
      test5(context: AopContext) {}

      @AfterReturning('*.getUsers')
      test6(context: AopContext, result: any) {}

      @AfterThrowing('get*')
      test7(context: AopContext, tx: Error) {}
    }
    AopProcessor.weave();
  });
});
