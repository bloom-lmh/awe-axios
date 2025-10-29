import { ThrottleConfig, ThrottleOptions } from '../../../httpMethod';
import { HttpMtdDecoratorConfigHandler } from '../handler/HttpMtdDecoratorConfigHandler';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';

/* export function useThrottle(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, config: ThrottleOptions) {
  let { interval, signal } = config as Required<ThrottleOptions>;

  let lastTime = 0;
  let timer: any = null;
  let pendingResolve: ((value: any) => void) | null = null;
  let pendingReject: ((reason?: any) => void) | null = null;
  let pendingArgs: HttpMethodDecoratorConfig | null = null;

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

  return async (config: HttpMethodDecoratorConfig) => {
    // 取消节流
    if (signal.isAborted()) {
      return await requestFn(config);
    }

    const currentTime = Date.now();

    // 首次调用直接执行
    if (lastTime === 0) {
      lastTime = currentTime;
      return await requestFn(config);
    }
    // 后续调用节流执行
    const elapsed = currentTime - lastTime;

    // 时间到了，立即执行
    if (elapsed >= interval) {
      lastTime = currentTime;
      return await requestFn(config);
    }

    // 否则：节流中，排队等待
    pendingArgs = config;

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
 */

export function useThrottle(fn: (...args: any[]) => Promise<any>, config: ThrottleConfig = {}) {
  const throttleConfig = HttpMtdDecoratorConfigHandler.handleThrottleConfig(config);
  let { interval } = throttleConfig as Required<ThrottleOptions>;

  let lastTime = 0;
  let timer: any = null;
  let pendingResolve: ((value: any) => void) | null = null;
  let pendingReject: ((reason?: any) => void) | null = null;
  let pendingArgs: any[] | null = null;

  // 节流时间到时执行run方法
  const run = async () => {
    if (!pendingArgs || !pendingResolve) return;

    try {
      const result = await fn(...pendingArgs);
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

  return async (...args: any[]) => {
    const currentTime = Date.now();

    // 首次调用直接执行
    if (lastTime === 0) {
      lastTime = currentTime;
      return await fn(...args);
    }
    // 后续调用节流执行
    const elapsed = currentTime - lastTime;

    // 时间到了，立即执行
    if (elapsed >= interval) {
      lastTime = currentTime;
      return await fn(...args);
    }

    // 否则：节流中，排队等待
    pendingArgs = args;

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
