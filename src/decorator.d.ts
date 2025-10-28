import { ComponentDecoratorConfig } from './decorator';
import { AxiosPlusRequestConfig } from './httpMethod';
import { DependencyConfig, InstanceRegisterConfig } from './ioc';

/**
 * 构造器
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * 被装饰类原型
 */
type DecoratedClassProto = {};

/**
 * 被装饰类
 */
export type DecoratedClass<T = any> = Constructor<T>;

/**
 * 被装饰类或原型
 */
export type DecoratedClassOrProto = DecoratedClass | DecoratedClassProto;

/**
 * 类装饰器
 */
export type ClassDecorator = (target: DecoratedClass) => void;

/**
 * 方法装饰器
 */
export type MethodDecorator = (
  target: DecoratedClassOrProto,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => void;

/**
 * 属性装饰器
 */
export type PropertyDecorator = (target: DecoratedClassOrProto, propertyKey: string) => void;

/**
 * 参数装饰器
 */
export type ParameterDecorator = (
  target: DecoratedClassOrProto,
  propertyKey: string | symbol,
  paramIndex: number,
) => void;

/**
 * 装饰器
 */
export type Decorator = ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator;

/**
 * param 装饰器配置
 */
export type ParamDecoratorConfig = {
  paramName: string;
  paramIndex: number;
};

/**
 * 装饰器类型
 */
export type DecoratorType = 'httpMethod' | 'ioc' | 'method' | 'class' | 'property' | 'parameter' | 'unknown';

/**
 * 装饰器信息模板
 */
export interface DecorationInfo {
  /**
   * 装饰器编号
   */
  id?: string;
  /**
   * 装饰器信息名称
   */
  name: string | symbol;
  /**
   * 装饰器所示类别
   */
  type: DecoratorType;

  /**
   * 装饰器信息配置
   */
  configs?: any[];
  /**
   * 装饰器冲突列表
   */
  conflictList?: (string | symbol)[];
  /**
   * 所依赖的装饰器列表
   */
  dependsOn?: (string | symbol)[];
}

/**
 * 子装饰器信息
 */
export interface SubDecorationConfigs {
  /**
   * 所属装饰器名：子装饰器配置
   */
  [key: string | symbol]: any;
}
