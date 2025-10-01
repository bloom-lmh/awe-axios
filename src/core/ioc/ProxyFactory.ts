/**
 * 代理工厂
 */
export class ProxyFactory {
  /**
   * 代理方法列表
   * @description 可撤销切面代理
   */
  private static invokeMap: WeakMap<Function, Function> = new WeakMap();

  /**
   * 记录原始方法
   * @param proxy 被切面代理的方法
   * @param invoke 原方法
   */
  static registerInvoke(proxy: Function, invoke: Function) {
    this.invokeMap.set(proxy, invoke);
  }

  /**
   * 获取invoke函数
   * @param proxy 被切面代理的对象
   * @returns invoke函数和原函数
   */
  static getInvoke(proxy: Function) {
    return this.invokeMap.get(proxy);
  }
}
