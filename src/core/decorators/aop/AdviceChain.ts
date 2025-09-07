import { AspectContext } from './AspectContext';
import { Interceptor, InterceptorChain } from './types/aop';

/**
 * 方法拦截器链
 */
export class AdviceChain implements InterceptorChain {
  /**
   * 拦截器链
   */
  private interceptors: Interceptor[];

  /**
   * 当前拦截器索引
   */
  private index: number;

  /**
   * @param interceptors 拦截器链
   */
  constructor() {
    this.interceptors = [];
    this.index = 0;
  }
  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
  }
  /**
   * 调用拦截器链的拦截器
   */
  proceed(context: AspectContext) {
    if (this.index < this.interceptors.length) {
      let interceptor = this.interceptors[this.index];
      this.index++;
      return interceptor!.invoke(context, this);
    } else {
      const { target, args, method } = context;
      return method.apply(target, args);
    }
  }
}
