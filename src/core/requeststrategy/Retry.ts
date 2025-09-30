import { RetryOptions } from '../decorators/httpMethod/types/httpMethod';
import { HttpMethodDecoratorConfig } from '../decorators/httpMethod/types/HttpMethodDecoratorConfig';

/**
 * 请求重传策略
 * @param requestExcutor
 * @returns
 */
export function useRetry(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, config: RetryOptions) {
  const { count, delay, signal } = config as Required<RetryOptions>;
  // 实现请求重传
  return async (config: HttpMethodDecoratorConfig) => {
    if (signal && signal.isAborted()) {
      return await requestFn(config);
    }
    // 最后一次错误
    let lastError;

    // 进行请求重传
    for (let i = 0; i < count; i++) {
      try {
        // 第一次请求不延迟
        if (i > 0) {
          // 指数退避
          const backoffDelay = delay * Math.pow(2, i - 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
        // 需要await才能捕获错误，否则返回拒绝的promise
        return await requestFn(config);
      } catch (error) {
        lastError = error;
        if (i >= count - 1) {
          break;
        }
      }
    }
    throw lastError;
  };
}
