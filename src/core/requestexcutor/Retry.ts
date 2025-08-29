import { RetryConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { Signal } from '../signal/Signal';

/**
 * 请求重传策略
 * @param requestExcutor
 * @returns
 */
export function withRetry(requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>, config: RetryConfig) {
  // 默认配置
  let defaultConfig = {
    count: 3,
    delay: 100,
    signal: new Signal(),
  };
  // 处理配置
  if (!config) {
    return requestFn;
  }
  if (typeof config === 'number') {
    defaultConfig.count = config;
  }
  if (config instanceof Signal) {
    config = { signal: config };
  }
  if (typeof config === 'object') {
    defaultConfig = { ...defaultConfig, ...config };
  }
  if (Array.isArray(config)) {
    defaultConfig.count = config[0] || defaultConfig.count;
    defaultConfig.delay = config[1] || defaultConfig.delay;
  }
  const { count, delay, signal } = defaultConfig;
  // 实现请求重传
  return async (httpRequestConfig: HttpRequestConfig) => {
    if (signal.isAborted()) {
      return await requestFn(httpRequestConfig);
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
          console.log(`执行了:${i + 1}次,延时${delay},幂等性${backoffDelay}`);
        }

        return await requestFn(httpRequestConfig);
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
