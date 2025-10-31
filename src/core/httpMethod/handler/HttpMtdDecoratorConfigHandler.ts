import { DecoratorConfigHandler } from '@/core/common/handler/DecoratorConfigHandler';
import { Signal } from '@/core/common/signal/Signal';
import { Method } from 'axios';
import { HttpResponse } from 'msw';
import { RetryConfig, RetryOptions, ThrottleConfig, DebounceConfig, MockConfig } from '../../../httpMethod';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from '../types/HttpRequestConfig';
import { HttpSubDecoratorConfigHandler } from './HttpSubDecoratorConfigHandler';

/**
 * http方法装饰器配置处理器
 */
export class HttpMtdDecoratorConfigHandler extends DecoratorConfigHandler {
  /**
   * 预处理方法装饰器配置
   * @param decoratorConfig http方法装饰器配置
   */
  preHandleConfig(method: Method = 'get'): this {
    this.config = this.config || '';
    if (typeof this.config === 'string') {
      this.config = { url: this.config };
    }
    this.config.method = method;
    return this;
  }
  /**
   * 预处理mock配置
   * @param mockConfig mock配置
   */
  preHandleMockConfig(): this {
    if (!this.config) return this;
    let defaultConfig = {
      handlers: {
        default: () => {
          return HttpResponse.json({
            message: 'welcome to use AxiosPlusMock',
          });
        },
      },
    };
    let { mock, mockHandlers } = this.config;

    // 若没有mock配置或配置为false，表示不采用mock
    if (!mock && !mockHandlers) {
      return this;
    }
    if (!mock && mockHandlers) {
      mock = { handlers: mockHandlers };
    }
    // 若配置为一个函数，则覆盖默认的handler
    if (typeof mock === 'function') {
      mock = { handlers: { default: mock } };
    }
    if (typeof mockHandlers === 'function') {
      mockHandlers = { default: mockHandlers };
    }
    if (typeof mock.handlers === 'function') {
      mock.handlers = { default: mock.handlers };
    }
    // 先合并handler
    const handlers = { ...defaultConfig.handlers, ...mockHandlers, ...mock.handlers };
    // 合并全部配置
    mock = { ...defaultConfig, ...mock };
    mock.handlers = handlers;
    this.config.mock = mock;
    return this;
  }
  /**
   * retryConfig处理
   */
  static handleRetryConfig(retry: RetryConfig): RetryOptions {
    // 默认配置
    let defaultConfig = {
      count: 3,
      delay: 100,
      //signal: new Signal(),
    };
    if (typeof retry === 'number') {
      defaultConfig.count = retry;
    }
    /*   if (retry instanceof Signal) {
      retry = { signal: retry };
    } */
    if (typeof retry === 'object') {
      defaultConfig = { ...defaultConfig, ...retry };
    }
    if (Array.isArray(retry)) {
      defaultConfig.count = retry[0] || defaultConfig.count;
      defaultConfig.delay = retry[1] || defaultConfig.delay;
    }

    return defaultConfig;
  }
  /**
   * 预处理retry配置
   */
  preHandleRetryConfig() {
    if (!this.config) return this;
    let { retry } = this.config;

    if (!retry) {
      return this;
    }

    // 默认配置
    this.config.retry = HttpMtdDecoratorConfigHandler.handleRetryConfig(retry);
    return this;
  }
  /**
   * 处理节流
   */
  static handleThrottleConfig(throttle: ThrottleConfig) {
    // 默认配置
    let defaultConfig = {
      interval: 100,
      signal: new Signal(),
    };

    // 处理配置
    if (typeof throttle === 'number') {
      defaultConfig.interval = throttle;
    }
    /* if (throttle instanceof Signal) {
      throttle = { signal: throttle };
    } */
    if (typeof throttle === 'object') {
      defaultConfig = { ...defaultConfig, ...throttle };
    }
    return defaultConfig;
  }
  /**
   * 预处理节流配置
   */
  preHandleThrottleConfig() {
    if (!this.config) return this;
    let { throttle } = this.config;

    if (!throttle) {
      return this;
    }

    this.config.throttle = HttpMtdDecoratorConfigHandler.handleThrottleConfig(throttle);
    return this;
  }

  /**
   * 处理防抖
   */
  static handleDebounceConfig(debounce: DebounceConfig) {
    // 默认配置
    let defaultConfig = {
      signal: new Signal(),
      immediate: false,
      delay: 100,
    };

    // 配置处理
    if (typeof debounce === 'number') {
      defaultConfig.delay = debounce;
    }
    /*  if (debounce instanceof Signal) {
      debounce = { signal: debounce };
    } */
    if (typeof debounce === 'object') {
      defaultConfig = { ...defaultConfig, ...debounce };
    }
    return defaultConfig;
  }
  /**
   * 预处理防抖配置
   */
  preHandleDebounceConfig() {
    if (!this.config) return this;
    let { debounce } = this.config;
    if (!debounce) {
      return this;
    }
    this.config.debounce = HttpMtdDecoratorConfigHandler.handleDebounceConfig(debounce);
    return this;
  }

  /**
   * 合并http装饰器和子项配置
   * @description 当有原子装饰器定义在http方法装饰器下时，需要将httpMethod装饰器与之进行合并，这个操作只会执行一次
   */
  mergeSubItemsConfig(
    decoratorConfig: HttpMethodDecoratorConfig,
    subItemsConfig: HttpMethodDecoratorConfig = {},
  ): HttpRequestConfig {
    // 要追加的项
    // const { transformRequest, transformResponse, mock, retry, throttle, debounce } = subItemsConfig;
    const { transformRequest, transformResponse, mock } = subItemsConfig;

    let httpRequestConfig = HttpSubDecoratorConfigHandler.chain(decoratorConfig)
      .mergeMockConfig(mock as MockConfig)
      .mergeTransformRequest(transformRequest)
      .mergeTransformResponse(transformResponse)
      /*  .mergeRetryConfig(retry as RetryOptions)
      .mergeDebounceConfig(debounce as DebounceOptions)
      .mergeThrottleConfig(throttle as ThrottleOptions) */
      .mergeOthers(subItemsConfig)
      .getHttpRequestConfig();
    // 返回包装后的配置
    return httpRequestConfig;
  }
}
