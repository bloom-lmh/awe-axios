import { DecoratedClassOrProto } from '../decorators/decorator';

/**
 * 装饰器校验器
 * @description 封装装饰器校验的通用方法
 */
export interface DecoratorValidator {
  /**
   * 检查装饰器依赖的装饰器是否存在
   */
  hasDependentedDecorator(
    target: DecoratedClassOrProto,
    dpDecorators: (string | symbol)[],
    propertyKey?: string | symbol,
  ): boolean;
  /**
   * 检查装饰器是否与其它装饰冲突
   */
  isDecoratorConflict(
    target: DecoratedClassOrProto,
    conflictList: (string | symbol)[],
    propertyKey?: string | symbol,
    paramIndex?: number,
  ): boolean;
}
