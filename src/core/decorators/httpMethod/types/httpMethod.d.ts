import { Signal } from '@/core/signal/Signal';
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
