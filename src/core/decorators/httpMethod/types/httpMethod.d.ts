import { Axios, AxiosInstance } from 'axios';

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
    }
  | boolean
  | number
  | [number, number];

/**
 * 防抖配置
 */
export type DebounceConfig =
  | {
      /**
       * 取消防抖的信号量
       */
      signal?: any;
      /**
       * 防抖延时
       */
      delay?: number;
    }
  | boolean
  | number;

/**
 * 节流配置
 */
export type ThrottleConfig =
  | {
      /**
       * 取消节流的信号量
       */
      signal?: any;
      /**
       * 节流间隔
       */
      interval?: number;
    }
  | boolean
  | number;
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
}
