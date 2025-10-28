import { ParameterDecorator } from '../../decorator';
import { BodyParamDecoratorFactory } from './BodyParamDecoratorFactory';
import { PathParamDecoratorFactory } from './PathParamDecoratorFactory';
import { QueryParamDecoratorFactory } from './QueryParamDecoratorFactory';

/**
 * Body参数装饰器
 */
export function BodyParam(paramName: string = ''): ParameterDecorator {
  return new BodyParamDecoratorFactory().createDecorator(paramName);
}
/**
 * 路径参数装饰器
 */
export function PathParam(paramName: string) {
  return new PathParamDecoratorFactory().createDecorator(paramName);
}
/**
 * 查询参数装饰器
 */
export function QueryParam(paramName: string): ParameterDecorator {
  return new QueryParamDecoratorFactory().createDecorator(paramName);
}
