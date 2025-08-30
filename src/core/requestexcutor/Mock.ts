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
  let loaded = false;
  // 实现mock
  return (config: HttpMethodDecoratorConfig) => {
    // 获取配置
    let { mock, url = '', baseURL, allowAbsoluteUrls, method } = config;
    // 处理配置
    const { handlers, condition, on } = mock! as MockConfig;
    // mock处理器没有加载则加载
    if (!loaded) {
      // 1. 处理路径
      let absUrl = '';
      if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
        absUrl = PathUtils.chain(url).concat(id).toResult();
      } else {
        absUrl = PathUtils.chain(baseURL!).concat(url).concat(id).toResult();
      }

      // 2. 注册mock
      if (typeof handlers === 'object') {
        for (const key in handlers) {
          absUrl = PathUtils.chain(absUrl).concat(key).removeExtraSlash().removeExtraSpace().toResult();
          MockAPI.registerHandlers(http[method as MockMethod](absUrl, handlers[key]));
        }
      }
      if (typeof handlers === 'function') {
        absUrl = PathUtils.chain(absUrl).concat('default').removeExtraSlash().removeExtraSpace().toResult();
        MockAPI.registerHandlers(http[method as MockMethod](absUrl, handlers));
      }
      loaded = true;
    }

    return async (type: string = 'default') => {
      // 若满足条件则走mock
      if (on && condition && condition()) {
        config.url = PathUtils.chain(config.url).concat(id, type).removeExtraSlash().removeExtraSpace().toResult();
        return requestFn(config);
      }
      // 否则走真实请求
      return requestFn(config);
    };
  };
}
