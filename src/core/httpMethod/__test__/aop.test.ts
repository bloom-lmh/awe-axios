import {
  Aspect,
  Before,
  Component,
  HttpApi,
  Get,
  HttpResponse,
  MockAPI,
  AspectContext,
  After,
  Around,
  AdviceChain,
  AfterReturning,
  AfterThrowing,
  Post,
  BodyParam,
} from '@/index';
import { beforeAll, describe, test } from 'vitest';

beforeAll(() => {
  MockAPI.on();
});
describe('aop test', () => {
  test('切点装饰器', async () => {
    function reusableExp() {
      return 'getUser*';
    }
    @Aspect(1)
    class Logger {
      @Before(reusableExp)
      log(ctx: AspectContext) {
        console.log('before getUser*');
      }
      @After(reusableExp)
      logAfter(ctx: AspectContext) {
        console.log('after getUser*');
      }
      @Around('getUser*')
      logAround(ctx: AspectContext, adviceChain: AdviceChain) {
        console.log('around before getUser*');
        const result = adviceChain.proceed(ctx);
        console.log('arount after getUser*');
        return result;
      }
      @AfterReturning('getUser*')
      logAfterReturning(ctx: AspectContext, result: any) {
        console.log(result);
        console.log('afterReturning getUser*');
      }
      @AfterThrowing('getUser*')
      logAfterThrowing(ctx: AspectContext, error: any) {
        console.log('afterThrowing getUser*');
      }
    }
    @Aspect(2)
    class Logger2 {
      @Before(reusableExp)
      log(ctx: AspectContext) {
        console.log('2before getUser*');
      }
      @After(reusableExp)
      logAfter(ctx: AspectContext) {
        console.log('2after getUser*');
      }
      @Around('getUser*')
      logAround(ctx: AspectContext, adviceChain: AdviceChain) {
        console.log('2around before getUser*');
        const result = adviceChain.proceed(ctx);
        console.log('2arount after getUser*');
        return result;
      }
      @AfterReturning('getUser*')
      logAfterReturning(ctx: AspectContext, result: any) {
        console.log(result);
        console.log('2afterReturning getUser*');
      }
      @AfterThrowing('getUser*')
      logAfterThrowing(ctx: AspectContext, error: any) {
        console.log('2afterThrowing getUser*');
      }
    }
    @Component()
    @HttpApi('http://localhost:3000/api/users')
    class UserApi {
      @Post({
        url: '/pages',
        headers: {
          'Content-Type': 'application/json',
        },
        mock: async ({ request }) => {
          const data = await request.json();
          const { page, size } = data as { page: number; size: number };
          /* console.log(page, size);
          console.log(request.headers); */

          return HttpResponse.json({
            message: 'ok',
            data: { id: 1, name: '张三' },
          });
        },
      })
      getUserPages(@BodyParam() data: { page: number; size: number }): any {}
    }

    const userApi = new UserApi();
    const { data } = await userApi.getUserPages({ page: 1, size: 10 })();
    console.log(data);
  });
});
