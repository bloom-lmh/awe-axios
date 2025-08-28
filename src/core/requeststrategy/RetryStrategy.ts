import { RetryConfig } from '../decorators/httpMethod/types/httpMethod';

/**
 * 请求重传策略
 * @param requestExcutor
 * @returns
 */
export function RetryStrategy(requestFn: () => Promise<any>, config: RetryConfig) {
  // 默认配置
  const defaultConfig = {
    count: 3,
    delay: 1000,
  };
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
  if (!config) {
    return requestFn;
  }
  const { count, delay } = defaultConfig;

  // 返回执行函数
  return async () => {
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
        return await requestFn();
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
