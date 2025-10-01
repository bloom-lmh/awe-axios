import { HttpRequestConfig } from '../httpMethod/types/HttpRequestConfig';

/**
 * aop 上下文
 */
export class AspectContext {
  /**
   * 原方法
   */
  method: Function;
  /**
   * 原方法this
   */
  target: any;
  /**
   * 原方法参数
   */
  args: any[];

  /**
   * axios配置
   */
  axiosConfig?: HttpRequestConfig;

  /**
   *
   * @param method 原方法
   * @param target 原方法this
   * @param args 原方法参数
   */
  constructor(method: Function, target: any, args: any[]) {
    this.method = method;
    this.args = args;
    this.target = target;
  }

  /**
   * 设置axios配置
   * @param config axios配置
   */
  setAxiosConfig(config: HttpRequestConfig) {
    this.axiosConfig = config;
    return this;
  }
}
