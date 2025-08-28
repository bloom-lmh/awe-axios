import { DecoratedClass, DecoratorType, SubDecorationConfigs } from '../decorators/decorator';
import { DecoratorInfo } from '../decorators/DecoratorInfo';

/**
 * 元数据管理器接口
 */
export interface DecoratorStateManager {
  /**
   * 是否有装饰器信息元数据列表
   */
  hasDecoratorInfos(target: DecoratedClass, propertyKey?: string | symbol): boolean;

  /**
   * 是否有指定装饰器信息元数据
   */
  hasDecoratorInfo(target: DecoratedClass, decoratorName: string | symbol, propertyKey?: string | symbol): boolean;

  /**
   * 是否有某种类型的装饰器信息
   */
  hasDecoratorInfoOfType(target: DecoratedClass, decoratorType: DecoratorType, propertyKey?: string | symbol): boolean;

  /**
   * 设置类装饰器信息列表元数据
   */
  setDecoratorInfos(target: DecoratedClass, decoratorInfos: DecoratorInfo[], propertyKey?: string | symbol): void;

  /**
   * 在添加装饰器信息
   */
  setDecoratorInfo(target: DecoratedClass, decoratorInfo: DecoratorInfo, propertyKey?: string | symbol): void;

  /**
   * 设置子装饰器配置
   */
  initSubDecoratorConfig(
    target: DecoratedClass,
    decoratorName: string | symbol,
    propertyKey?: string | symbol,
    config?: any,
  ): void;

  /**
   * 获取所有装饰器信息
   */
  getDecoratorInfos(target: DecoratedClass, propertyKey?: string | symbol): DecoratorInfo[] | undefined;

  /**
   * 获取装饰器信息元数据
   */
  getDecoratorInfo(
    target: DecoratedClass,
    decoratorName: string | symbol,
    propertyKey?: string | symbol,
  ): DecoratorInfo | undefined;

  /**
   * 根据类型获取装饰器信息
   */
  getDecoratorInfosByType(
    target: DecoratedClass,
    decoratorType: DecoratorType,
    propertyKey?: string | symbol,
  ): DecoratorInfo[] | undefined;

  /**
   * 获取子装饰器列表
   */
  getAllSubDecoratorConfig(target: DecoratedClass, propertyKey?: string | symbol): SubDecorationConfigs | undefined;

  /**
   * 获取子装饰配置
   */
  getSubDecoratorConfig(target: DecoratedClass, decoratorName: string | symbol, propertyKey?: string | symbol): any;
}
