import { DebounceConfig, DebounceOptions } from '../../../httpMethod';
import { HttpMtdDecoratorConfigHandler } from '../handler/HttpMtdDecoratorConfigHandler';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from '../types/HttpRequestConfig';

/**
 * 防抖请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
/* export function useDebounce(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, config: DebounceOptions) {
  // 实现防抖
  let { delay, immediate, signal } = config as Required<DebounceOptions>;
  let timer: any;
  return async (config: HttpRequestConfig) => {
    // 取消防抖
    if (signal.isAborted()) {
      return await requestFn(config);
    }

    // 立即执行
    if (immediate) {
      immediate = false;
      return await requestFn(config);
    }

    timer && clearTimeout(timer);
    return new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          const result = await requestFn(config);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timer = null;
        }
      }, delay);
    });
  };
} */
export function useDebounce(fn: (...args: any[]) => unknown, config: DebounceConfig = {}) {
  const debounceConfig = HttpMtdDecoratorConfigHandler.handleDebounceConfig(config);
  // 实现防抖
  let { delay, immediate } = debounceConfig as Required<DebounceOptions>;
  let timer: any;
  return async (...args: any[]) => {
    // 立即执行
    if (immediate) {
      immediate = false;
      return await fn(...args);
    }

    timer && clearTimeout(timer);
    return new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timer = null;
        }
      }, delay);
    });
  };
}
