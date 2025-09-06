/**
 * aop 上下文
 */
export class AspectContext {
  /**
   * 原方法
   */
  method: Function;
  /**
   * 原方法this
   */
  target: any;
  /**
   * 原方法参数
   */
  args: any[];

  constructor(method: Function, target: any, args: any[]) {
    this.method = method;
    this.args = args;
    this.target = target;
  }
}
