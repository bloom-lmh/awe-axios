import { MockMethod } from './../decorators/httpMethod/types/httpMethod.d';
import { PathUtils } from '@/utils/PathUtils';
import { MockConfig } from '../decorators/httpMethod/types/httpMethod';
import { MockAPI } from '../decorators/mock/MockAPI';
import { http } from 'msw';
import { HttpMethodDecoratorConfig } from '../decorators/httpMethod/types/HttpMethodDecoratorConfig';

/**
 * mock请求
 */
export function withMock(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, id: string) {
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
      if (typeof handlers === 'function') {
        let fullPath = PathUtils.chain(absUrl)
          .concat(id, 'default', rltUrl)
          .removeExtraSlash()
          .removeExtraSpace()
          .toResult();

        MockAPI.registerHandlers(http[method as MockMethod](fullPath, handlers));
      }
      if (typeof handlers === 'object') {
        for (const key in handlers) {
          let fullPath = PathUtils.chain(absUrl)
            .concat(id, key, rltUrl)
            .removeExtraSlash()
            .removeExtraSpace()
            .toResult();
          MockAPI.registerHandlers(http[method as MockMethod](fullPath, handlers[key]));
        }
      }

      loaded = true;
    }

    return async (type: string = 'default') => {
      let isMock = on;
      if (condition) {
        isMock = condition();
      }
      if (signal) {
        isMock = !signal.isAborted();
      }
      if (count) {
        isMock = count > 0;
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
