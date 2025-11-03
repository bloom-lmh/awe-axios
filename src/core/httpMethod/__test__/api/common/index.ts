import { HttpMethodDecoratorConfig, Post } from '@/index';

/**
 * 分页查询装饰器
 * @param config 请求配置
 * @returns post装饰器
 */
export function Pages(config: HttpMethodDecoratorConfig) {
  config.headers = {
    'Content-Type': 'application/json',
  };
  return Post(config);
}
