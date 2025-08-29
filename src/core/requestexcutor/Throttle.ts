import { ThrottleConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { Signal } from '../signal/Signal';

/**
 * 节流请求策略
 */
export function withThrottle(
  requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>,
  config: ThrottleConfig,
) {
  // 默认配置
  let defaultConfig = {
    interval: 100,
    signal: new Signal(),
    immediate: true,
  };
  if (!config) {
    return requestFn;
  }
  // 处理配置
  if (typeof config === 'number') {
    defaultConfig.interval = config;
  }
  if (config instanceof Signal) {
    config = { signal: config };
  }
  if (typeof config === 'object') {
    defaultConfig = { ...config, ...defaultConfig };
  }
  // 实现节流
  let { interval, immediate, signal } = defaultConfig;
  let lastTime = Date.now();
  let timer: any = null;
  return async (httpRequestConfig: HttpRequestConfig) => {
    if (signal.isAborted()) {
      return await requestFn(httpRequestConfig);
    }
    // 首次直接执行
    if (immediate) {
      immediate = !immediate;
      return await requestFn(httpRequestConfig);
    }
    // 获取当前时间
    let currentTime = Date.now();
    // 获取剩余时间
    let remainTime = interval - (currentTime - lastTime);
    // 清除定时器
    clearTimeout(timer);
    // 剩余时间小于0，立即执行(解决定时器的不精确的问题)
    if (remainTime <= 0) {
      return await requestFn(httpRequestConfig);
    } else {
      // 剩余时间大于0，设置定时器
      timer = setTimeout(async () => {
        return await requestFn(httpRequestConfig);
      }, remainTime);
    }
  };
}
