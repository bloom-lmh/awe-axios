/**
 * 函数工具
 */
export class FuncUtils {
  /**
   * 函数记忆
   */
  static memorizable(fn: Function) {
    let cache = new Map();
    let _this = this;
    return function (...args: any[]) {
      const key = JSON.stringify(args);
      // 若有则从缓存中返回
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn.apply(_this, args);
      cache.set(key, result);
      return result;
    };
  }
}
