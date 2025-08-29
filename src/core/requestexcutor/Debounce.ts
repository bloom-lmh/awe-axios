import { DebounceConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { Signal } from '../signal/Signal';

/**
 * 防抖请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
export function withDebounce(
  requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>,
  config: DebounceConfig,
) {
  // 默认配置
  let defaultConfig = {
    signal: new Signal(),
    delay: 100,
  };
  if (!config) {
    return requestFn;
  }
  // 配置处理
  if (typeof config === 'number') {
    defaultConfig.delay = config;
  }
  if (config instanceof Signal) {
    config = { signal: config };
  }
  if (typeof config === 'object') {
    defaultConfig = { ...config, ...defaultConfig };
  }
  // 实现防抖
  const { delay, signal } = defaultConfig;
  let lastTime = Date.now();
  return async (httpRequestConfig: HttpRequestConfig) => {
    // 取消防抖
    if (signal.isAborted()) {
      return await requestFn(httpRequestConfig);
    }
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
