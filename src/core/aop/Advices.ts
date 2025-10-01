import { AdviceChain } from './AdviceChain';
import {
  AdviceMethod,
  AdviceType,
  AfterAdviceMethod,
  AfterReturningAdviceMethod,
  AfterThrowingAdviceMethod,
  AroundAdviceMethod,
  BeforeAdviceMethod,
  Interceptor,
} from './types/aop';
import { AspectContext } from './AspectContext';

/**
 * 通知方法
 */
export abstract class Advice<T> implements Interceptor {
  /**
   * 通知方法
   */
  protected adviceFunc: T;

  /**
   * @param fn 通知方法
   */
  constructor(fn: T) {
    this.adviceFunc = fn;
  }

  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  abstract invoke(context: AspectContext, adviceChain: AdviceChain): any;
}

/**
 * 前置通知
 */
export class BeforeAdvice extends Advice<BeforeAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AspectContext, adviceChain: AdviceChain) {
    // 前置通知方法调用
    this.adviceFunc(context);
    return adviceChain.proceed(context);
  }
}

/**
 * 后置通知
 */
export class AfterAdvice extends Advice<AfterAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AspectContext, adviceChain: AdviceChain) {
    const result = adviceChain.proceed(context);
    this.adviceFunc(context);
    return result;
  }
}
/**
 * 环绕通知
 */
export class AroundAdvice extends Advice<AroundAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AspectContext, adviceChain: AdviceChain) {
    const result = this.adviceFunc(context, adviceChain);
    return result;
  }
}

/**
 * 后置通知伴随返回值
 */
export class AfterReturningAdvice extends Advice<AfterReturningAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AspectContext, adviceChain: AdviceChain) {
    const result = adviceChain.proceed(context);
    this.adviceFunc(context, result);
    return result;
  }
}

/**
 * 后置通知伴随异常
 */
export class AfterThrowingAdvice extends Advice<AfterThrowingAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AspectContext, adviceChain: AdviceChain) {
    try {
      const result = adviceChain.proceed(context);
      return result;
    } catch (error) {
      this.adviceFunc(context, error);
      throw error;
    }
  }
}

/**
 * 通知工厂
 */
export class AdviceFactory {
  /**
   * 包装原始方法为Advice
   * @param adviceType 通知类型
   * @param method 原始方法
   * @returns
   */
  static getAdvice<T extends AdviceMethod>(activeType: AdviceType, method: T) {
    if (activeType === 'before') {
      return new BeforeAdvice(method as BeforeAdviceMethod);
    }
    if (activeType === 'after') {
      return new AfterAdvice(method as AfterAdviceMethod);
    }
    if (activeType === 'around') {
      return new AroundAdvice(method as AroundAdviceMethod);
    }
    if (activeType === 'afterReturning') {
      return new AfterReturningAdvice(method as AfterReturningAdviceMethod);
    }
    if (activeType === 'afterThrowing') {
      return new AfterThrowingAdvice(method as AfterThrowingAdviceMethod);
    }
  }
}
