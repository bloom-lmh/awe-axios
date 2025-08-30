import { Signal } from '@/core/signal/Signal';
import { Axios, AxiosInstance } from 'axios';
import { DefaultBodyType, RequestHandlerOptions } from 'msw';
import { HttpResponseResolver, PathParams } from 'msw';

/**
 * 请求重传配置
 */
export type RetryConfig =
  | {
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
    }
  | boolean // 是否开启，开启则采用默认值
  | number // 请求重传的次数
  | Signal
  | [number, number]; // 请求重传次数和延时（基础延时）

/**
 * 防抖配置
 */
export type DebounceConfig =
  | {
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
    }
  | boolean
  | number
  | Signal;

/**
 * 节流配置
 */
export type ThrottleConfig =
  | {
      /**
       * 取消节流的信号量
       */
      signal?: Signal;
      /**
       * 节流间隔
       */
      interval?: number;
    }
  | boolean
  | number
  | Signal;

/**
 * mockHandlers
 *  options?: RequestHandlerOptions
 */
export type MockHandlers =
  | {
      [key: string | symbol]: HttpResponseResolver<PathParams, DefaultBodyType, undefined>;
    }
  | HttpResponseResolver<PathParams, DefaultBodyType, undefined>;

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
   * @returns 如果返回true接口会走mock 返回false走真实接口
   * @description 当某个接口开发完毕时可以关闭mock，走真实接口
   */
  on?: (() => boolean) | boolean;

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
   * 防抖
   */
  debounce?: DebounceConfig;

  /**
   * 节流
   */
  throttle?: ThrottleConfig;

  /**
   * mock 处理器
   */
  mock?: MockConfig;
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
  mockOn?: (() => boolean) | boolean;
};
