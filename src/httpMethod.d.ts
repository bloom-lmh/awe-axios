import { Signal } from '@/core/signal/Signal';
import { Axios, AxiosInstance } from 'axios';
import { DefaultBodyType, RequestHandlerOptions } from 'msw';
import { HttpResponseResolver, PathParams } from 'msw';

/**
 * retry选项
 */
export type RetryOptions = {
  /**
   * 请求重传次数
   */
  count?: number;
  /**
   * 请求重传延时(单位ms)
   */
  delay?: number;
  /**
   * 信号量
   */
  signal?: Signal;
};
/**
 * 请求重传配置
 */
export type RetryConfig =
  | RetryOptions
  | boolean // 是否开启，开启则采用默认值
  | number // 请求重传的次数
  | Signal
  | [number, number]; // 请求重传次数和延时（基础延时）

/**
 * 防抖选项
 */
export type DebounceOptions = {
  /**
   * 首次是否立即执行
   */
  immediate?: boolean;
  /**
   * 防抖延时
   */
  delay?: number;
  /**
   * 信号量
   */
  signal?: Signal;
};
/**
 * 防抖配置
 */
export type DebounceConfig = DebounceOptions | boolean | number | Signal;

/**
 * 节流选项
 */
export type ThrottleOptions = {
  /**
   * 取消节流的信号量
   */
  signal?: Signal;
  /**
   * 节流间隔
   */
  interval?: number;
};
/**
 * 节流配置
 */
export type ThrottleConfig = ThrottleOptions | boolean | number | Signal;

/**
 * 单个mockHandler函数
 */
export type MockHandler = HttpResponseResolver<PathParams, DefaultBodyType, undefined>;
/**
 * 包含多个mockhandler的对象
 */
export type MockHandlersObject = {
  [key: string | symbol]: MockHandler;
};

/**
 * mockHandlers
 *  options?: RequestHandlerOptions
 */
export type MockHandlers = MockHandlersObject | MockHandler;

/**
 * mock配置
 */
export type MockConfig = {
  /**
   * mock处理器
   */
  handlers?: MockHandlers;
  /**
   * 是否开启mock
   * @description 开启后，若条件满足则所有请求都会走mock接口
   */
  on?: boolean;
  /**
   * 走mock的条件
   * @description 开启mock后，为了不改变原代码，我们可以设置走真实接口的条件
   */
  condition?: () => boolean;
  /**
   * 运作次数
   * @description mock次数，当接口被mock对应次数后不再访问mock接口
   */
  count?: number;

  /**
   * 取消mock的信号量
   * @description 区别于condition，这个可以动态的取消mock
   */
  signal?: Signal;
};
/**
 * http方法
 */
export type MockMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch';

/**
 * AxiosPlus为axios请求配置增加的额外配置
 */
export interface AxiosPlusRequestConfig {
  /**
   * axios实例
   */
  refAxios?: AxiosInstance;
  /**
   * 基本路径
   */
  baseURL?: string;
  /**
   * 相对路径
   */
  url?: string;
  /**
   * 请求重传
   */
  retry?: RetryConfig;
  /**
   * 自定义重传方式
   */
  customRetry?: RetryRequestPolicy;
  /**
   * 防抖
   */
  debounce?: DebounceConfig;
  /**
   * 自定义防抖
   */
  customDebounce?: DebounceRequestPolicy;
  /**
   * 节流
   */
  throttle?: ThrottleConfig;
  /**
   * 自定义节流
   */
  customThrottle?: ThrottleRequestPolicy;
  /**
   * mock 处理器
   */
  mock?: MockConfig | MockHandler;
}

/**
 * httpApi 装饰器配置
 */
export type HttpApiDecoratorConfig = {
  /**
   * 基本路径
   */
  baseURL?: string;
  /**
   * 相对路径
   */
  url?: string;
  /**
   * axios引用
   */
  refAxios?: AxiosInstance;
  /**
   * mock配置
   */
  mock?: {
    /**
     * 是否开启mock
     */
    on?: boolean;
    /**
     * 走mock的条件
     * @description 开启mock后，为了不改变原代码，我们可以设置走真实接口的条件
     */
    condition?: () => boolean;
  };
};

/**
 * 请求策略函数
 */
type RequestPolicy<T> = (
  requestFn: (config: HttpMethodDecoratorConfig) => Promise<any>,
  config: T,
) => (config: HttpMethodDecoratorConfig) => Promise<any>;

/**
 * 请求重传策略
 */
export type RetryRequestPolicy = RequestPolicy<RetryOptions>;

/**
 * 防抖策略
 */
export type DebounceRequestPolicy = RequestPolicy<DebounceOptions>;

/**
 * 节流策略
 */
export type ThrottleRequestPolicy = RequestPolicy<ThrottleOptions>;
