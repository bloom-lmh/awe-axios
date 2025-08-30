import { HttpRequestConfig } from '@/core/decorators/httpMethod/types/HttpRequestConfig';
import { DecoratorConfigHandler } from '../DecoratorConfigHandler';
import { HttpMethodDecoratorConfig } from '@/core/decorators/httpMethod/types/HttpMethodDecoratorConfig';
import { MockConfig } from '@/core/decorators/httpMethod/types/httpMethod';

/**
 * http方法装饰器配置处理器
 */
export class HttpMtdDecoratorConfigHandler extends DecoratorConfigHandler {
  /**
   * 合并http装饰器和子项配置
   * @description 当有原子装饰器定义在http方法装饰器下时，需要将httpMethod装饰器与之进行合并，这个操作只会执行一次
   */
  mergeSubItemsConfig(
    decoratorConfig: HttpMethodDecoratorConfig,
    subItemsConfig: HttpMethodDecoratorConfig,
  ): HttpRequestConfig {
    // 要追加的项
    const { transformRequest, transformResponse } = subItemsConfig;
    // 覆盖配置
    decoratorConfig = { ...subItemsConfig, ...decoratorConfig };
    // 包装配置
    const httpRequestConfig = new HttpRequestConfig(decoratorConfig);
    // 追加配置项
    httpRequestConfig.appendTransformRequest(transformRequest).appendTransformResponse(transformResponse);

    return httpRequestConfig;
  }
}
