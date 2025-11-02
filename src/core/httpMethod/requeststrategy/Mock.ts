import { MockAPI } from '@/core/mock/MockAPI';
import { PathUtils } from '@/utils/PathUtils';
import { http } from 'msw';
import { MockConfig, MockMethod, MockHandlersObject, MockHandlers } from '../../../httpMethod';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';
import { ObjectUtils } from '@/utils/ObjectUtils';

/**
 * mock请求
 */
/* export function useMock(requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>, id: string) {
  // 是否加载handler
  let loaded = false;
  let absUrl = '';
  let rltUrl = '';
  // 实现mock
  // config为运行时配置
  return (config: HttpMethodDecoratorConfig) => {
    console.log(config);

    // 获取配置
    let { mock, allowAbsoluteUrls, url = '', baseURL, method } = config;

    let { handlers, condition, on, count, signal } = mock! as MockConfig;
    // 没有注册则注册
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
        console.log('a', fullPath);

        MockAPI.registerHandlers(http[method as MockMethod](fullPath, (handlers as MockHandlersObject)[key]));
      }
      loaded = true;
    }

    return async (type: string = 'default') => {
      let isMock = on;
      // 条件满足且mock接口打开
      if (condition) {
        isMock = isMock && condition();
      }
      // 信号未中断
      if (signal) {
        isMock = isMock && !signal.isAborted();
      }
      if (count) {
        isMock = isMock && count > 0;
      }
      // 若满足条件则走mock
      if (isMock) {
        let finalUrl = '';
        let finalBaseURL = '';
        let baseURL = PathUtils.chain(absUrl).concat(id, type).removeExtraSlash().removeExtraSpace();

        if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
          // 应该找到以最后的路径占位符为分割点进行分割
          let parseURL = new URL(url);
          absUrl = parseURL.origin;
          rltUrl = parseURL.pathname;
          finalUrl = baseURL.concat(rltUrl).toResult();
        } else {
          finalBaseURL = baseURL.toResult();
          finalUrl = url;
        }
        let cfg = ObjectUtils.deepClone(config);
        let result = requestFn({
          ...cfg,
          url: finalUrl,
          baseURL: finalBaseURL,
        });
        if (count) count--;
        return result;
      }

      // 否则走真实请求
      return requestFn(config);
    };
  };
} */

export function useMock(
  requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>,
  rawConfig: { id: string; url: string; baseURL: string; count: number },
) {
  // 是否已经注册了mock处理器
  let registered = false;
  let count = rawConfig.count;
  // 记录未加工的config
  return (config: HttpMethodDecoratorConfig) => {
    // 处理运行时配置
    let { url = '', baseURL, allowAbsoluteUrls, method } = config;
    let { handlers, condition, on, signal } = config.mock as MockConfig;

    // 首次调用才进行注册
    if (!registered) {
      // 1. 处理路径
      let { id, url, baseURL } = rawConfig;
      if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
        const parseURL = new URL(url);
        baseURL = parseURL.origin;
        url = parseURL.pathname;
      }
      // 2. 注册mock
      for (const type in handlers) {
        let fullPath = PathUtils.chain(baseURL).concat(id, type, url).removeExtraSlash().removeExtraSpace().toResult();
        //console.log('fullPath:', fullPath);
        MockAPI.registerHandlers(http[method as MockMethod](fullPath, (handlers as MockHandlersObject)[type]));
      }
      registered = true;
    }
    return async (type: string = 'default') => {
      let isMock = !!on;
      // 条件满足且mock接口打开
      if (condition) {
        isMock = isMock && condition();
      }
      // 信号未中断
      if (signal) {
        isMock = isMock && !signal.isAborted();
      }
      if (count != undefined && count != null) {
        isMock = isMock && count > 0;
      }
      //console.log('isMock:', isMock);

      // 若满足条件则走mock
      if (isMock) {
        //console.log('url:', url);

        // 1. 处理路径
        if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
          const parseURL = new URL(url);
          baseURL = parseURL.origin;
          config.url = parseURL.pathname;
        }
        config.baseURL = PathUtils.chain(rawConfig.baseURL)
          .concat(rawConfig.id, type)
          .removeExtraSlash()
          .removeExtraSpace()
          .toResult();
        //console.log(config.baseURL, url);

        --count;
        return requestFn(config);
      }
      return requestFn(config);
    };
  };
}
