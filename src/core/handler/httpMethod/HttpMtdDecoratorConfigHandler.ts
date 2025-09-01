import { HttpRequestConfig } from '@/core/decorators/httpMethod/types/HttpRequestConfig';
import { DecoratorConfigHandler } from '../DecoratorConfigHandler';
import { HttpMethodDecoratorConfig } from '@/core/decorators/httpMethod/types/HttpMethodDecoratorConfig';
import { Method } from 'axios';
import { HttpResponse } from 'msw';
import { ObjectUtils } from '@/utils/ObjectUtils';
import { Signal } from '@/core/signal/Signal';

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
    if (!mock) {
      this.config.mock = {};
      return this;
    }
    // 若配置为一个函数，则覆盖默认的handler
    if (typeof mock === 'function') {
      defaultConfig.handlers.default = mock;
    }
    // 若是配置对象
    if (typeof mock === 'object' && !ObjectUtils.isEmpty(mock)) {
      let defaultHandlers = defaultConfig.handlers;
      // 合并配置
      defaultConfig = Object.assign(defaultConfig, mock);
      if (typeof mock.handlers === 'function') {
        defaultConfig.handlers = { default: mock.handlers };
      }
      if (typeof mock.handlers === 'object') {
        // 合并handlers
        defaultConfig.handlers = Object.assign(defaultHandlers, mock.handlers);
      }
    }
    if (typeof mockHandlers === 'function') {
      mockHandlers = { default: mockHandlers };
    }
    // 若mockhandlers存在则合并
    defaultConfig.handlers = { ...mockHandlers, ...defaultConfig.handlers };
    this.config.mock = defaultConfig;
    return this;
  }

  /**
   * 预处理retry配置
   */
  preHandleRetryConfig() {
    if (!this.config) return this;
    let { retry } = this.config;
    // 默认配置
    let defaultConfig = {
      count: 3,
      delay: 100,
      signal: new Signal(),
    };
    // 处理配置
    if (!retry) {
      return this;
    }
    if (typeof retry === 'number') {
      defaultConfig.count = retry;
    }
    if (retry instanceof Signal) {
      retry = { signal: retry };
    }
    if (typeof retry === 'object') {
      defaultConfig = { ...defaultConfig, ...retry };
    }
    if (Array.isArray(retry)) {
      defaultConfig.count = retry[0] || defaultConfig.count;
      defaultConfig.delay = retry[1] || defaultConfig.delay;
    }
    this.config.retry = defaultConfig;
    return this;
  }

  /**
   * 预处理节流配置
   */
  preHandleThrottleConfig() {
    // 默认配置
    let defaultConfig = {
      interval: 100,
      signal: new Signal(),
    };
    let { throttle } = this.config;
    if (!throttle) {
      return this;
    }
    // 处理配置
    if (typeof throttle === 'number') {
      defaultConfig.interval = throttle;
    }
    if (throttle instanceof Signal) {
      throttle = { signal: throttle };
    }
    if (typeof throttle === 'object') {
      defaultConfig = { ...defaultConfig, ...throttle };
    }
    this.config.throttle = defaultConfig;
    return this;
  }

  /**
   * 预处理防抖配置
   */
  preHandleDebounceConfig() {
    // 默认配置
    let defaultConfig = {
      signal: new Signal(),
      immediate: false,
      delay: 100,
    };
    let { debounce } = this.config;
    if (!debounce) {
      return this;
    }
    // 配置处理
    if (typeof debounce === 'number') {
      defaultConfig.delay = debounce;
    }
    if (debounce instanceof Signal) {
      debounce = { signal: debounce };
    }
    if (typeof debounce === 'object') {
      defaultConfig = { ...defaultConfig, ...debounce };
    }
    this.config.debounce = defaultConfig;
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
    const { transformRequest, transformResponse } = subItemsConfig;
    // 覆盖配置
    decoratorConfig = { ...subItemsConfig, ...decoratorConfig };
    // 重新设置合并后的配置
    let httpRequestConfig = new HttpRequestConfig(decoratorConfig);
    // 追加配置项
    httpRequestConfig.appendTransformRequest(transformRequest).appendTransformResponse(transformResponse);
    // 返回包装后的配置
    return httpRequestConfig;
  }
}
