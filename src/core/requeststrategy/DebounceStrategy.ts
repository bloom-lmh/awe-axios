import { DebounceConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';

/**
 * 防抖请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
export function DebounceStrategy(
  requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>,
  config: DebounceConfig,
) {
  // 默认配置
  const defaultConfig = {
    signal: null,
    delay: 100,
  };
  if (!config) {
    return requestFn;
  }
  // 配置处理
  if (typeof config === 'number') {
    defaultConfig.delay = config;
  }
  if (typeof config === 'object') {
    defaultConfig.delay = config.delay || defaultConfig.delay;
    defaultConfig.signal = config.signal || defaultConfig.signal;
  }
  // 实现防抖
  const { delay, signal } = defaultConfig;
  let lastTime = Date.now();
  return async (httpRequestConfig: HttpRequestConfig) => {
    // 取消防抖
    /*  if (!signal) {
      return await requestFn(httpRequestConfig);
    } */
    // 获取本次执行时间
    let currentTime = Date.now();
    // 本次执行时间与上次执行时间间隔
    let span = currentTime - lastTime;
    if (delay >= span) {
      return await requestFn(httpRequestConfig);
    } else {
      lastTime = currentTime;
    }
  };
}
