import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { DecoratorConfigHandler } from '../handler/DecoratorConfigHandler';
import axios from 'axios';

/**
 * 请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
export function baseRequest(): any {
  return (config: HttpRequestConfig) => {
    const { refAxios = axios } = config;
    // 树摇配置
    const axiosRequestConfig = DecoratorConfigHandler.treeShakingConfig(config.getOriginalConfig(), [
      'refAxios',
      'retry',
      'debounce',
      'throttle',
    ]);

    return refAxios(axiosRequestConfig);
  };
}
