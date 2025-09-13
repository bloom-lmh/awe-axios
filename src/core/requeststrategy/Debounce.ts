import { DebounceConfig, DebounceOptions } from '../decorators/httpMethod/types/httpMethod';
import { HttpMethodDecoratorConfig } from '../decorators/httpMethod/types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { Signal } from '../signal/Signal';

/**
 * 防抖请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
export function useDebounce(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, config: DebounceOptions) {
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
    clearTimeout(timer);
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
}
