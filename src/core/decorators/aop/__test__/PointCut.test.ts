import { Advice } from '..';

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
      @Advice(exp)
      test() {}
    }
  });
});
