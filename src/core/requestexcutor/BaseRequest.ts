import { HttpMethodDecoratorConfig } from '../decorators/httpMethod/types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from '../decorators/httpMethod/types/HttpRequestConfig';
import { DecoratorConfigHandler } from '../handler/DecoratorConfigHandler';
import axios from 'axios';

/**
 * 请求策略
 * @param requestFn 请求函数
 * @param config 防抖配置
 */
export function baseRequest(): any {
  return (config: HttpMethodDecoratorConfig) => {
    const { refAxios = axios } = config;
    // 树摇配置
    const axiosRequestConfig = DecoratorConfigHandler.treeShakingConfig(config, [
      'refAxios',
      'retry',
      'debounce',
      'throttle',
    ]);
    console.log('最终baseURL:', axiosRequestConfig.baseURL);
    console.log('最终url:', axiosRequestConfig.url);
    return refAxios(axiosRequestConfig);
  };
}
