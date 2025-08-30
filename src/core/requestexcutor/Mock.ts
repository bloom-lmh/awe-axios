import { DecorationInfo } from '../decorators/decorator';
import { DecoratorInfo } from '../decorators/DecoratorInfo';
import { MockConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';

/**
 * mock请求
 */
export function withMock(requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>, config: any) {
  // 获取配置
  const { mock, url, baseURL, allowAbsoluteUrls, id } = config;
  // 处理配置
  const { handlers, condition } = mock! as MockConfig;
  if (typeof handlers === 'function') {
  } else if (typeof handlers === 'object') {
  } else {
  }

  // 实现mock
  return (httpRequestConfig: HttpRequestConfig) => {
    return {
      mock: (type: 'default') => {
        // 若满足条件则走mock
        if (condition && condition()) {
        }
        // 否则走真实请求
        return requestFn(httpRequestConfig);
      },
    };
  };
}
