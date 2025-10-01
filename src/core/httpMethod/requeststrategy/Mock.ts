import { MockAPI } from '@/core/mock/MockAPI';
import { PathUtils } from '@/utils/PathUtils';
import { http } from 'msw';
import { MockConfig, MockMethod, MockHandlersObject } from '../types/httpMethod';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';

/**
 * mock请求
 */
export function useMock(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, id: string) {
  // 是否加载handler
  let loaded = false;
  let absUrl = '';
  let rltUrl = '';
  // 实现mock
  return (config: HttpMethodDecoratorConfig) => {
    // 获取配置
    let { mock, url = '', baseURL, allowAbsoluteUrls, method } = config;
    let { handlers, condition, on, count, signal } = mock! as MockConfig;
    // 处理配置
    if (!loaded) {
      // 1. 处理路径
      absUrl = baseURL!;
      rltUrl = url;

      // 若url为绝对路径,且允许使用绝对路径进行发送
      if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
        // 应该找到以最后的路径占位符为分割点进行分割
        let parseURL = new URL(url);
        absUrl = parseURL.origin;
        rltUrl = parseURL.pathname;
      }

      // 2. 注册mock
      for (const key in handlers) {
        let fullPath = PathUtils.chain(absUrl).concat(id, key, rltUrl).removeExtraSlash().removeExtraSpace().toResult();
        MockAPI.registerHandlers(http[method as MockMethod](fullPath, (handlers as MockHandlersObject)[key]));
      }
      loaded = true;
    }

    return async (type: string = 'default') => {
      let isMock = on;
      if (condition) {
        isMock = isMock && condition();
      }
      if (signal) {
        isMock = isMock && !signal.isAborted();
      }
      if (count) {
        isMock = isMock && count > 0;
      }

      // 若满足条件则走mock
      if (isMock) {
        let baseURL = PathUtils.chain(absUrl).concat(id, type).removeExtraSlash().removeExtraSpace();
        if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
          config.url = baseURL.concat(rltUrl).toResult();
        } else {
          config.baseURL = baseURL.toResult();
          config.url = rltUrl;
        }
        let result = requestFn(config);
        if (count) count--;
        return result;
      }
      // 否则走真实请求
      return requestFn(config);
    };
  };
}
