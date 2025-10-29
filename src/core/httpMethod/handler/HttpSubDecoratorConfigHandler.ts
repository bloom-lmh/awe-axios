import { AxiosRequestTransformer, AxiosResponseTransformer } from 'axios';
import { MockConfig, RetryOptions, DebounceOptions, ThrottleOptions } from '../../../httpMethod';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from '../types/HttpRequestConfig';

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
   * 处理transformRequest数组
   */
  mergeTransformRequest(transformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[]) {
    const { transformRequest: httpTransformRequest } = this.httpConfig;
    if (transformRequest) {
      this.httpConfig.transformRequest = HttpSubDecoratorConfigHandler.mergeTransformRequest(
        httpTransformRequest,
        transformRequest,
      );
    }

    return this;
  }
  /**
   * 处理transformResponse数组
   */
  mergeTransformResponse(transformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[]) {
    const { transformResponse: httpTransformResponse } = this.httpConfig;
    if (transformResponse) {
      this.httpConfig.transformResponse = HttpSubDecoratorConfigHandler.mergeTransformResponse(
        httpTransformResponse,
        transformResponse,
      );
    }
    return this;
  }
  /**
   * 处理retry
   */
  mergeRetryConfig(retryConfig: RetryOptions) {
    const { retry } = this.httpConfig;
    if (retry) {
      this.httpConfig.retry = HttpSubDecoratorConfigHandler.mergeRetryConfig(retry as RetryOptions, retryConfig);
    }
    return this;
  }
  /**
   * 处理debounce
   */
  mergeDebounceConfig(debounceConfig: DebounceOptions) {
    const { debounce } = this.httpConfig;
    if (debounce) {
      this.httpConfig.debounce = HttpSubDecoratorConfigHandler.mergeDebounceConfig(
        debounce as DebounceOptions,
        debounceConfig,
      );
    }
    return this;
  }
  /**
   * 处理节流
   */
  mergeThrottleConfig(throttleConfig: ThrottleOptions) {
    const { throttle } = this.httpConfig;
    if (throttle) {
      this.httpConfig.throttle = HttpSubDecoratorConfigHandler.mergeThrottleConfig(
        throttle as ThrottleOptions,
        throttleConfig,
      );
    }
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
  /**
   * 处理transformRequest
   */
  static mergeTransformRequest(
    httpTransformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[],
    transformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[],
  ) {
    if (!httpTransformRequest) {
      return transformRequest;
    } else if (!transformRequest) {
      return httpTransformRequest;
    } else {
      let httpTransformReqs = Array.isArray(httpTransformRequest) ? httpTransformRequest : [httpTransformRequest];
      let transformReqs = Array.isArray(transformRequest) ? transformRequest : [transformRequest];
      return [...httpTransformReqs, ...transformReqs];
    }
  }
  /**
   * 处理transformResponse
   */
  static mergeTransformResponse(
    httpTransformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[],
    transformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[],
  ) {
    if (!httpTransformResponse) {
      return transformResponse;
    } else if (!transformResponse) {
      return httpTransformResponse;
    } else {
      let httpTransformReqs = Array.isArray(httpTransformResponse) ? httpTransformResponse : [httpTransformResponse];
      let transformReqs = Array.isArray(transformResponse) ? transformResponse : [transformResponse];
      return [...httpTransformReqs, ...transformReqs];
    }
  }

  /**
   * 处理retry
   * @param httpRetryConfig HttpMethod装饰器上的配置
   * @param retryConfig 子项装饰器上的配置
   * @description HttpMethod装饰器上的配置优先级更高
   */
  static mergeRetryConfig(httpRetryConfig: RetryOptions, retryConfig: RetryOptions) {
    return { ...retryConfig, ...httpRetryConfig };
  }
  /**
   * 处理debounce
   */
  static mergeDebounceConfig(httpDebounceConfig: DebounceOptions, debounceConfig: DebounceOptions) {
    return { ...httpDebounceConfig, debounceConfig };
  }
  /**
   * 处理throttle
   */
  static mergeThrottleConfig(httpThrottleConfig: ThrottleOptions, throttleConfig: ThrottleOptions) {
    return { ...throttleConfig, ...httpThrottleConfig };
  }
}
