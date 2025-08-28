import { RetryConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';

/**
 * 请求重传策略
 * @param requestExcutor
 * @returns
 */
export function RetryStrategy(requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>, config: RetryConfig) {
  // 默认配置
  const defaultConfig = {
    count: 3,
    delay: 1000,
  };
  if (!config) {
    return requestFn;
  }
  if (typeof config === 'number') {
    defaultConfig.count = config;
  }
  if (typeof config === 'object') {
    config = config as {};
    defaultConfig.count = config.count || defaultConfig.count;
    defaultConfig.delay = config.delay || defaultConfig.delay;
  }
  if (Array.isArray(config)) {
    defaultConfig.count = config[0] || defaultConfig.count;
    defaultConfig.delay = config[1] || defaultConfig.delay;
  }
  const { count, delay } = defaultConfig;
  // 返回执行函数
  return async (httpRequestConfig: HttpRequestConfig) => {
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
        return await requestFn(httpRequestConfig);
      } catch (error) {
        lastError = error;
        if (i === count - 1) {
          break;
        }
      }
    }
    throw lastError;
  };
}
