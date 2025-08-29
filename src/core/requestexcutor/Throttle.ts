import { ThrottleConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { Signal } from '../signal/Signal';

/**
 * 节流请求策略
 */
/* export function withThrottle(
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
  let _promise: Promise<any> | null = null;
  return async (httpRequestConfig: HttpRequestConfig) => {
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

    // 清除定时器
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // 剩余时间小于0，立即执行(解决定时器的不精确的问题)
    if (remainTime <= 0) {
      console.log('非promise执行了');
      lastTime = Date.now();
      return await requestFn(httpRequestConfig);
    } else {
      return new Promise((resolve, reject) => {
        timer = setTimeout(async () => {
          try {
            const result = await requestFn(httpRequestConfig);
            lastTime = Date.now();
            console.log('promise 执行了');
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            timer = null;
            // 由于还有变量保存着promise所以不会被垃圾回收
            _promise = null;
          }
        }, remainTime);
      });
    }
  };
} */

export function withThrottle(
  requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>,
  config: ThrottleConfig,
) {
  // 默认配置
  let defaultConfig = {
    interval: 100,
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

  let { interval, signal } = defaultConfig;

  let lastTime = 0;
  let timer: any = null;
  let pendingResolve: ((value: any) => void) | null = null;
  let pendingReject: ((reason?: any) => void) | null = null;
  let pendingArgs: HttpRequestConfig | null = null;

  // 节流时间到时执行run方法
  const run = async () => {
    if (!pendingArgs || !pendingResolve) return;

    try {
      const result = await requestFn(pendingArgs);
      lastTime = Date.now();
      pendingResolve(result);
    } catch (error) {
      pendingReject?.(error);
    } finally {
      timer = null;
      pendingArgs = null;
      pendingResolve = null;
      pendingReject = null;
    }
  };

  return async (httpRequestConfig: HttpRequestConfig) => {
    // 取消节流
    if (signal.isAborted()) {
      return await requestFn(httpRequestConfig);
    }

    const currentTime = Date.now();

    // 首次调用直接执行
    if (lastTime === 0) {
      console.log('节流首次执行');

      lastTime = currentTime;
      return await requestFn(httpRequestConfig);
    }
    // 后续调用节流执行
    const elapsed = currentTime - lastTime;

    // 时间到了，立即执行
    if (elapsed >= interval) {
      lastTime = currentTime;
      return await requestFn(httpRequestConfig);
    }

    // 否则：节流中，排队等待
    pendingArgs = httpRequestConfig;

    if (!timer) {
      const remainTime = interval - elapsed;
      timer = setTimeout(run, remainTime);
    }

    // 返回一个 Promise，等待 run() 执行
    return new Promise((resolve, reject) => {
      pendingResolve = resolve;
      pendingReject = reject;
    });
  };
}
