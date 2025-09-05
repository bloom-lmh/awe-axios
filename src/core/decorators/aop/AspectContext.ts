/**
 * aop 上下文
 */
export class AspectContext {
  /**
   * 原方法
   */
  method: Function;
  /**
   * 原方法参数
   */
  args: any[];
  /**
   * 原方法this
   */
  target: any;

  constructor(method: Function, args: any[], target: any) {
    this.method = method;
    this.args = args;
    this.target = target;
  }
}
