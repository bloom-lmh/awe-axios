import { AdviceChain } from './AdviceChain';
import {
  AdviceType,
  AfterAdviceMethod,
  AfterReturningAdviceMethod,
  AfterThrowingAdviceMethod,
  AopContext,
  AroundAdviceMethod,
  BeforeAdviceMethod,
  Interceptor,
} from './types/aop';

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
  abstract invoke(context: AopContext, adviceChain: AdviceChain): any;
}

/**
 * 前置通知
 */
export class beforeAdvice extends Advice<BeforeAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AopContext, adviceChain: AdviceChain) {
    // 前置通知方法调用
    this.adviceFunc(context);
    return adviceChain.proceed(context);
  }
}

/**
 * 后置通知
 */
export class afterAdvice extends Advice<AfterAdviceMethod> {
  /**
   * 调用原方法和通知方法
   * @param context 上下文对象
   * @param adviceChain 通知链
   */
  invoke(context: AopContext, adviceChain: AdviceChain) {
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
  invoke(context: AopContext, adviceChain: AdviceChain) {
    return this.adviceFunc(context, adviceChain);
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
  invoke(context: AopContext, adviceChain: AdviceChain) {
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
  invoke(context: AopContext, adviceChain: AdviceChain) {
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
  /* getAdvice(adviceType: AdviceType,method:): Advice<any> {

  } */
}
