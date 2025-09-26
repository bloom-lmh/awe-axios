import { Component } from '@/core/decorators';
import { MockConfig } from '@/core/decorators/httpMethod/types/httpMethod';
import { HttpMethodDecoratorConfig } from '@/core/decorators/httpMethod/types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from '@/core/decorators/httpMethod/types/HttpRequestConfig';

/**
 * httpmethod 子项装饰器配置处理器
 */
export class HttpSubDecoratorConfigHandler {
  /**
   * 没有合并子项的原始http方法装饰器配置
   */
  private httpConfig: HttpMethodDecoratorConfig;

  constructor(httpConfig: HttpMethodDecoratorConfig) {
    this.httpConfig = httpConfig;
  }

  static chain(httpConfig: HttpMethodDecoratorConfig) {
    return new HttpSubDecoratorConfigHandler(httpConfig);
  }

  /**
   * 处理mock子项
   */
  mergeMockConfig(mockConfig: MockConfig) {
    const { mock } = this.httpConfig;
    this.httpConfig.mock = HttpSubDecoratorConfigHandler.mergeMockConfig(mock as MockConfig, mockConfig);
    return this;
  }
  /**
   * 覆盖其它配置
   */
  mergeOthers(subItemsConfig: HttpMethodDecoratorConfig) {
    this.httpConfig = { ...subItemsConfig, ...this.httpConfig };
    return this;
  }
  /**
   * 获取结果
   */
  getHttpRequestConfig() {
    return new HttpRequestConfig(this.httpConfig);
  }
  /**
   * 处理mock子项
   */
  static mergeMockConfig(httpMockConfig: MockConfig | undefined | null, mockConfig: MockConfig) {
    if (!httpMockConfig) {
      return mockConfig;
    } else if (!mockConfig) {
      return httpMockConfig;
    } else {
      let mockHandlers = httpMockConfig.handlers;
      // 先合并handlers
      mockHandlers = { ...mockConfig.handlers, ...mockHandlers };
      // 合并其它配置
      httpMockConfig = { ...mockConfig, ...httpMockConfig, handlers: mockHandlers };
      return httpMockConfig;
    }
  }
}
