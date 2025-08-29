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
    immediate: true,
    signal: new Signal(),
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
    defaultConfig = { ...defaultConfig, ...config };
  }
  // 实现节流
  let { interval, immediate, signal } = defaultConfig;
  let lastTime = 0;
  let timer: any = null;
  let _resolve: ((value: any) => void) | null = null;
  return async (httpRequestConfig: HttpRequestConfig) => {
    // 取消节流
    if (signal.isAborted()) {
      return await requestFn(httpRequestConfig);
    }
    // 获取当前时间
    let currentTime = Date.now();
    // 如果是第一次调用，且 immediate 为 true，则立即执行
    if (lastTime === 0 && immediate) {
      lastTime = currentTime;
      return await requestFn(httpRequestConfig);
    }
    // 获取剩余时间
    let remainTime = interval - (currentTime - lastTime);
    // 清除掉前一次promise
    _resolve && _resolve(undefined);
    // 清除定时器
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // 剩余时间小于0，立即执行(解决定时器的不精确的问题)
    if (remainTime <= 0) {
      console.log('remainTime', remainTime);
      lastTime = currentTime;
      return await requestFn(httpRequestConfig);
    } else {
      return new Promise((resolve, reject) => {
        console.log('promise:remainTime', remainTime);

        _resolve = resolve;
        timer = setTimeout(async () => {
          try {
            const result = await requestFn(httpRequestConfig);
            lastTime = Date.now();
            console.log('promise:resolve:lastTime', lastTime);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            timer = null;
          }
        }, remainTime);
      });
    }
  };
}
