/**
 * 函数工具
 */
export class FuncUtils {
  /**
   * 函数记忆
   */
  static memorizable(fn: Function) {
    let cache = new WeakMap();
    return function (...args: any[]) {
      // 若有则从缓存中返回
    };
  }
}
