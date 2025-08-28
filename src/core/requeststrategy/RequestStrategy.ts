import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { DecoratorConfigHandler } from '../handler/DecoratorConfigHandler';
import axios from 'axios';

/**
 * 请求策略
 */
export function RequestStrategy(): any {
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
