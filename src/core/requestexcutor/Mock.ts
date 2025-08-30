import { MockConfig } from '../decorators/httpMethod/types/httpMethod';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';

/**
 * mock请求
 */
export function withMock(requestFn: (httpRequestConfig: HttpRequestConfig) => Promise<any>, config: MockConfig) {
  // 处理配置
  return (httpRequestConfig: HttpRequestConfig) => {};
}
