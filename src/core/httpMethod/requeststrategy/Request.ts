import { DecoratorConfigHandler } from '@/core/common/handler/DecoratorConfigHandler';
import axios from 'axios';
import { HttpMethodDecoratorConfig } from '../types/HttpMethodDecoratorConfig';

/**
 * 请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
export function useRequest(): any {
  return (config: HttpMethodDecoratorConfig) => {
    const { refAxios = axios, signal } = config;
    // 树摇配置
    /* const axiosRequestConfig = DecoratorConfigHandler.treeShakingConfig(config, [
      'refAxios',
      'retry',
      'debounce',
      'throttle',
      'mock',
    ]); */
    return refAxios(config);
  };
}
