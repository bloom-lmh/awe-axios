import { describe, expect, test } from 'vitest';

import {
  AdviceChain,
  After,
  AfterReturning,
  Around,
  Aspect,
  AspectContext,
  Before,
  Component,
  Inject,
} from '../index.js';

describe('@awe-axios/ioc-aop', () => {
  test('resolves injected instances with alias and scope support', () => {
    @Component()
    class UserRepository {
      readonly id = Math.random();
    }

    class UserService {
      @Inject(UserRepository)
      repo!: UserRepository;

      @Inject('userRepository')
      repoByAlias!: UserRepository;

      @Inject({
        ctor: UserRepository,
        scope: 'SINGLETON',
      })
      sharedOne!: UserRepository;

      @Inject({
        ctor: UserRepository,
        scope: 'SINGLETON',
      })
      sharedTwo!: UserRepository;
    }

    const service = new UserService();

    expect(service.repo).toBeInstanceOf(UserRepository);
    expect(service.repoByAlias).toBeInstanceOf(UserRepository);
    expect(service.repo).not.toBe(service.repoByAlias);
    expect(service.sharedOne).toBe(service.sharedTwo);
  });

  test('weaves before, around, after returning, and after advices onto components', () => {
    const calls: string[] = [];

    @Aspect(1)
    class LoggerAspect {
      @Before('PaymentService.pay')
      before(_context: AspectContext) {
        calls.push('before');
      }

      @Around('PaymentService.pay')
      around(context: AspectContext, chain: AdviceChain) {
        calls.push('around:before');
        const result = chain.proceed(context);
        calls.push('around:after');
        return result;
      }

      @AfterReturning('PaymentService.pay')
      afterReturning(_context: AspectContext, result: unknown) {
        calls.push(`afterReturning:${String(result)}`);
      }

      @After('PaymentService.pay')
      after(_context: AspectContext) {
        calls.push('after');
      }
    }

    @Component()
    class PaymentService {
      pay() {
        calls.push('pay');
        return 'ok';
      }
    }

    const result = new PaymentService().pay();

    expect(result).toBe('ok');
    expect(calls).toEqual(['around:before', 'before', 'pay', 'afterReturning:ok', 'after', 'around:after']);
  });
});
